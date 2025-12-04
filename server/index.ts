import express, { Request, Response, NextFunction } from 'express'
import axios, { AxiosError } from 'axios'
import * as fs from 'fs/promises'
import * as path from 'path'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// Types
interface Website {
  id: string
  url: string
  name: string
  createdAt: string
}

interface CrawlHistory {
  id: string
  websiteId: string
  timestamp: string
  content: string
  contentHash: string
}

interface ChangeDetection {
  id: string
  websiteId: string
  previousCrawlId: string
  currentCrawlId: string
  changes: string
  timestamp: string
  similarity: number
}

// Database file paths
const DATA_DIR = '/data'
const WEBSITES_FILE = path.join(DATA_DIR, 'websites.json')
const CRAWLS_FILE = path.join(DATA_DIR, 'crawls.json')
const CHANGES_FILE = path.join(DATA_DIR, 'changes.json')

// Initialize Express app
const app = express()
app.use(express.json())

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ error: message })
})

// Utility functions
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    console.warn('Data directory already exists')
  }
}

async function initializeFiles(): Promise<void> {
  await ensureDataDir()

  const files = [WEBSITES_FILE, CRAWLS_FILE, CHANGES_FILE]
  for (const file of files) {
    try {
      await fs.access(file)
    } catch {
      await fs.writeFile(file, JSON.stringify([], null, 2))
    }
  }
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    if ((err as any).code === 'ENOENT') return []
    throw err
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

async function fetchWebsiteContent(url: string, timeout = 10000): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Website-Change-Monitor/1.0'
      }
    })

    // Extract text content from HTML (simple strip of tags)
    const text = response.data
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return text.substring(0, 50000) // Limit content size
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw new Error(`Failed to fetch URL: ${axiosError.message}`)
  }
}

async function compareWithLLM(
  previousContent: string,
  currentContent: string
): Promise<{ changes: string; similarity: number }> {
  // If LLM is not available, use simple text comparison
  const similarity = currentContent === previousContent ? 1.0 : 0.5
  const changes =
    similarity > 0.95
      ? 'No significant changes detected'
      : `Content has changed. Previous length: ${previousContent.length} chars, Current length: ${currentContent.length} chars`

  return { changes, similarity }
}

// Routes
app.get('/websites', async (req: Request, res: Response) => {
  try {
    const websites = await readJsonFile<Website>(WEBSITES_FILE)
    res.json(websites)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch websites' })
  }
})

app.post('/websites', async (req: Request, res: Response) => {
  try {
    const { name, url } = req.body

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    const website: Website = {
      id: uuidv4(),
      name,
      url,
      createdAt: new Date().toISOString()
    }

    const websites = await readJsonFile<Website>(WEBSITES_FILE)
    websites.push(website)
    await writeJsonFile(WEBSITES_FILE, websites)

    res.status(201).json(website)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create website' })
  }
})

app.delete('/websites/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const websites = await readJsonFile<Website>(WEBSITES_FILE)
    const filtered = websites.filter((w) => w.id !== id)

    if (filtered.length === websites.length) {
      return res.status(404).json({ error: 'Website not found' })
    }

    await writeJsonFile(WEBSITES_FILE, filtered)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete website' })
  }
})

app.post('/crawl/:websiteId', async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params

    // Find website
    const websites = await readJsonFile<Website>(WEBSITES_FILE)
    const website = websites.find((w) => w.id === websiteId)

    if (!website) {
      return res.status(404).json({ error: 'Website not found' })
    }

    // Fetch content
    const content = await fetchWebsiteContent(website.url)
    const contentHash = hashContent(content)

    // Store crawl
    const crawl: CrawlHistory = {
      id: uuidv4(),
      websiteId,
      timestamp: new Date().toISOString(),
      content,
      contentHash
    }

    const crawls = await readJsonFile<CrawlHistory>(CRAWLS_FILE)
    crawls.push(crawl)
    await writeJsonFile(CRAWLS_FILE, crawls)

    // Check for changes
    const previousCrawl = crawls
      .filter((c) => c.websiteId === websiteId && c.id !== crawl.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

    if (previousCrawl) {
      const { changes, similarity } = await compareWithLLM(previousCrawl.content, content)

      const changeDetection: ChangeDetection = {
        id: uuidv4(),
        websiteId,
        previousCrawlId: previousCrawl.id,
        currentCrawlId: crawl.id,
        changes,
        timestamp: new Date().toISOString(),
        similarity
      }

      const changeDetections = await readJsonFile<ChangeDetection>(CHANGES_FILE)
      changeDetections.push(changeDetection)
      await writeJsonFile(CHANGES_FILE, changeDetections)
    }

    res.json({ success: true, data: crawl })
  } catch (err) {
    const error = err as Error
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to crawl website'
    })
  }
})

app.get('/changes/:websiteId', async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params
    const changes = await readJsonFile<ChangeDetection>(CHANGES_FILE)
    const filtered = changes
      .filter((c) => c.websiteId === websiteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    res.json(
      filtered.map((change) => ({
        id: change.id,
        data: change
      }))
    )
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch changes' })
  }
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Start server
const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await initializeFiles()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()

export interface Website {
  id: string
  url: string
  name: string
  createdAt: string
}

export interface CrawlHistory {
  id: string
  websiteId: string
  timestamp: string
  content: string
  contentHash: string
}

export interface ChangeDetection {
  id: string
  websiteId: string
  previousCrawlId: string
  currentCrawlId: string
  changes: string
  timestamp: string
  similarity: number
}

export interface CrawlResponse {
  success: boolean
  data?: CrawlHistory
  error?: string
}

export interface ChangeResponse {
  id: string
  data: ChangeDetection
}

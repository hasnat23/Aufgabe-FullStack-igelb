import axios, { AxiosError } from 'axios'
import type { Website, CrawlResponse, ChangeResponse } from '../types'

const API_BASE = '/api'

// Custom error class for better error handling
export class APIError extends Error {
  constructor(
    public statusCode: number | null,
    public originalError: unknown,
    message: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Handle HTTP errors with meaningful messages
 */
function handleError(error: unknown, context: string): APIError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    const statusCode = axiosError.response?.status ?? null
    const message = `${context}: ${axiosError.response?.status ?? 'Network error'} - ${
      (axiosError.response?.data as any)?.error || axiosError.message
    }`
    return new APIError(statusCode, error, message)
  }
  
  const message = `${context}: ${error instanceof Error ? error.message : String(error)}`
  return new APIError(null, error, message)
}

export async function fetchWebsites(): Promise<Website[]> {
  try {
    const response = await axios.get(`${API_BASE}/websites`, { timeout: 10000 })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to fetch websites')
  }
}

export async function createWebsite(website: Omit<Website, 'id' | 'createdAt'>): Promise<Website> {
  try {
    const response = await axios.post(`${API_BASE}/websites`, website, { timeout: 10000 })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to create website')
  }
}

export async function triggerCrawl(websiteId: string): Promise<CrawlResponse> {
  try {
    const response = await axios.post(
      `${API_BASE}/crawl/${websiteId}`,
      {},
      { timeout: 30000 }
    )
    return response.data
  } catch (error) {
    throw handleError(error, `Failed to crawl website ${websiteId}`)
  }
}

export async function getChangeHistory(websiteId: string): Promise<ChangeResponse[]> {
  try {
    const response = await axios.get(`${API_BASE}/changes/${websiteId}`, { timeout: 10000 })
    return response.data
  } catch (error) {
    throw handleError(error, `Failed to fetch change history for ${websiteId}`)
  }
}

export async function deleteWebsite(websiteId: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/websites/${websiteId}`, { timeout: 10000 })
  } catch (error) {
    throw handleError(error, `Failed to delete website ${websiteId}`)
  }
}

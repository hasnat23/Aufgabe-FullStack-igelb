import { expect, it, describe, vi, beforeEach, afterEach, Mock } from 'vitest'
import axios from 'axios'
import { fetchWebsites, createWebsite, triggerCrawl, APIError } from '../api/client'

vi.mock('axios')

// Type the mocked axios methods
const mockedAxiosGet = axios.get as Mock
const mockedAxiosPost = axios.post as Mock
const mockedIsAxiosError = axios.isAxiosError as unknown as Mock

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchWebsites', () => {
    it('should fetch websites successfully', async () => {
      const mockData = [
        { id: '1', url: 'https://example.com', name: 'Example', createdAt: '2024-01-01' }
      ]
      mockedAxiosGet.mockResolvedValueOnce({ data: mockData })

      const result = await fetchWebsites()

      expect(result).toEqual(mockData)
      expect(mockedAxiosGet).toHaveBeenCalledWith('/websites', { timeout: 10000 })
    })

    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error')
      mockedIsAxiosError.mockReturnValueOnce(false)
      mockedAxiosGet.mockRejectedValueOnce(mockError)

      try {
        await fetchWebsites()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).message).toContain('Fehler beim Abrufen von Websites')
      }
    })

    it('should handle HTTP errors with status codes', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        },
        message: 'Request failed'
      }
      mockedIsAxiosError.mockReturnValueOnce(true)
      mockedAxiosGet.mockRejectedValueOnce(mockError)

      try {
        await fetchWebsites()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).statusCode).toBe(500)
      }
    })
  })

  describe('createWebsite', () => {
    it('should create a website successfully', async () => {
      const mockData = { id: '1', url: 'https://new.com', name: 'New Site', createdAt: '2024-01-01' }
      mockedAxiosPost.mockResolvedValueOnce({ data: mockData })

      const result = await createWebsite({ url: 'https://new.com', name: 'New Site' })

      expect(result).toEqual(mockData)
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        '/websites',
        { url: 'https://new.com', name: 'New Site' },
        { timeout: 10000 }
      )
    })

    it('should handle creation failures', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid URL' }
        },
        message: 'Request failed'
      }
      mockedIsAxiosError.mockReturnValueOnce(true)
      mockedAxiosPost.mockRejectedValueOnce(mockError)

      try {
        await createWebsite({ url: 'invalid', name: 'Test' })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).message).toContain('Fehler beim Erstellen der Website')
      }
    })
  })

  describe('triggerCrawl', () => {
    it('should trigger crawl successfully', async () => {
      const mockData = {
        success: true,
        data: {
          id: 'crawl-1',
          websiteId: '1',
          timestamp: '2024-01-01T00:00:00Z',
          content: 'Page content',
          contentHash: 'hash123'
        }
      }
      mockedAxiosPost.mockResolvedValueOnce({ data: mockData })

      const result = await triggerCrawl('1')

      expect(result.success).toBe(true)
      expect(mockedAxiosPost).toHaveBeenCalledWith('/crawl/1', {}, { timeout: 30000 })
    })

    it('should handle crawl timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockedIsAxiosError.mockReturnValueOnce(false)
      mockedAxiosPost.mockRejectedValueOnce(mockError)

      try {
        await triggerCrawl('1')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).message).toContain('Fehler beim Crawl der Website 1')
      }
    })
  })
})

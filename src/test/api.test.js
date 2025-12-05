import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchWebsites, createWebsite, triggerCrawl, APIError } from '../api/client';
vi.mock('axios');
const mockedAxios = axios;
describe('API Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe('fetchWebsites', () => {
        it('should fetch websites successfully', async () => {
            const mockData = [
                { id: '1', url: 'https://example.com', name: 'Example', createdAt: '2024-01-01' }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockData });
            const result = await fetchWebsites();
            expect(result).toEqual(mockData);
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/websites', { timeout: 10000 });
        });
        it('should handle network errors gracefully', async () => {
            const mockError = new Error('Network error');
            mockedAxios.isAxiosError.mockReturnValueOnce(false);
            mockedAxios.get.mockRejectedValueOnce(mockError);
            try {
                await fetchWebsites();
                expect.fail('Should have thrown an error');
            }
            catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect(error.message).toContain('Failed to fetch websites');
            }
        });
        it('should handle HTTP errors with status codes', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' }
                },
                message: 'Request failed'
            };
            mockedAxios.isAxiosError.mockReturnValueOnce(true);
            mockedAxios.get.mockRejectedValueOnce(mockError);
            try {
                await fetchWebsites();
                expect.fail('Should have thrown an error');
            }
            catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect(error.statusCode).toBe(500);
            }
        });
    });
    describe('createWebsite', () => {
        it('should create a website successfully', async () => {
            const mockData = { id: '1', url: 'https://new.com', name: 'New Site', createdAt: '2024-01-01' };
            mockedAxios.post.mockResolvedValueOnce({ data: mockData });
            const result = await createWebsite({ url: 'https://new.com', name: 'New Site' });
            expect(result).toEqual(mockData);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/websites', { url: 'https://new.com', name: 'New Site' }, { timeout: 10000 });
        });
        it('should handle creation failures', async () => {
            const mockError = {
                response: {
                    status: 400,
                    data: { error: 'Invalid URL' }
                },
                message: 'Request failed'
            };
            mockedAxios.isAxiosError.mockReturnValueOnce(true);
            mockedAxios.post.mockRejectedValueOnce(mockError);
            try {
                await createWebsite({ url: 'invalid', name: 'Test' });
                expect.fail('Should have thrown an error');
            }
            catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect(error.message).toContain('Failed to create website');
            }
        });
    });
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
            };
            mockedAxios.post.mockResolvedValueOnce({ data: mockData });
            const result = await triggerCrawl('1');
            expect(result.success).toBe(true);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/crawl/1', {}, { timeout: 30000 });
        });
        it('should handle crawl timeout errors', async () => {
            const mockError = new Error('Request timeout');
            mockedAxios.isAxiosError.mockReturnValueOnce(false);
            mockedAxios.post.mockRejectedValueOnce(mockError);
            try {
                await triggerCrawl('1');
                expect.fail('Should have thrown an error');
            }
            catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect(error.message).toContain('Failed to crawl website 1');
            }
        });
    });
});

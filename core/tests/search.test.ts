import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Search } from '../src';
import { MockHttpClient } from './__mocks__/mockHttpClient';
import { MockStorageAdapter } from './__mocks__/mockStorage';
import { DiscogsError, ErrorCodes } from '../src/utils/errors';
import { createTestConfig } from './helpers/setup';
import { BaseImplementation } from '../src/base';

describe('Search', () => {
    let sdk: BaseImplementation;
    let httpClient: MockHttpClient;
    let storage: MockStorageAdapter;
    let search: Search;
    
    beforeEach(async () => {
        httpClient = new MockHttpClient();
        storage = new MockStorageAdapter();
        
        httpClient.clearMocks();

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const config = createTestConfig({
            storage,
            httpClient,
            DiscogsConsumerKey: 'test_consumer_key',
            DiscogsConsumerSecret: 'test_consumer_secret'
        });

        sdk = new BaseImplementation(config);
        search = new Search(sdk);
    });

    describe('authenticated searches', () => {
        beforeEach(async () => {
            // Set up mock tokens in storage
            await storage.setItem('accessToken', 'test_access_token');
            await storage.setItem('accessTokenSecret', 'test_access_secret');
            await storage.setItem('requestTokenSecret', 'test_request_secret');
        });

        it('should search releases with authentication', async () => {
            const mockResults = [{
                id: 123,
                title: 'Test Album',
                year: '2023',
                type: 'release'
            }];

            httpClient.setMockResponse('database/search', {
                ok: true,
                status: 200,
                data: mockResults
            });

            const result = await search.getSearchResults({
                query: 'test',
                type: 'release'
            });
            
            expect(result).toEqual(mockResults);
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should handle search with multiple parameters when authenticated', async () => {
            const mockResults = [{
                id: 123,
                title: 'Test Album',
                year: '1981',
                type: 'release'
            }];

            httpClient.setMockResponse('database/search', {
                ok: true,
                status: 200,
                data: mockResults
            });

            const result = await search.getSearchResults({
                query: 'Rush',
                type: 'release',
                year: '1981'
            });
            expect(result).toEqual(mockResults);
        });
    });

    describe('unauthenticated searches', () => {
        beforeEach(async () => {
            await storage.clear();
        });

        it('should perform search without authentication', async () => {
            const mockResults = [{
                id: 123,
                title: 'Test Album',
                year: '2023',
                type: 'release'
            }];

            httpClient.setMockResponse('database/search', {
                ok: true,
                status: 200,
                data: mockResults
            });

            const result = await search.getSearchResults({
                query: 'test',
                type: 'release'
            });
            
            expect(result).toEqual(mockResults);
            expect(console.warn).toHaveBeenCalledWith(
                'No authentication provided. Rate limits will be restricted to 25 requests/minute.'
            );
        });
    });

    describe('error handling', () => {
        it('should handle rate limiting', async () => {
            httpClient.setMockResponse('database/search', {
                ok: false,
                status: 429,
                data: 'Rate limit exceeded'
            });

            await expect(search.getSearchResults({ query: 'test' }))
                .rejects
                .toThrow(DiscogsError);
        });

        it('should handle API errors', async () => {
            httpClient.setMockResponse('database/search', {
                ok: false,
                status: 500,
                data: 'Internal Server Error'
            });

            await expect(search.getSearchResults({ query: 'test' }))
                .rejects
                .toThrow(DiscogsError);
        });

        it('should handle missing mock responses', async () => {
            const expectedEndpoint = 'database/search?q=test&';
            
            await expect(search.getSearchResults({ query: 'test' }))
                .rejects
                .toThrow(new DiscogsError(
                    `No mock response set for endpoint: ${expectedEndpoint}`,
                    ErrorCodes.NETWORK_ERROR
                ));
        });
    });

    describe('query parameter handling', () => {
        it('should correctly handle query parameters', async () => {
            const mockResults = [{ id: 123, title: 'Test Album' }];
            
            const setSpy = vi.spyOn(httpClient, 'setMockResponse');
            const requestSpy = vi.spyOn(httpClient, 'request');

            httpClient.setMockResponse('database/search', {
                ok: true,
                status: 200,
                data: mockResults
            });

            await search.getSearchResults({
                query: 'test album',
                type: 'release',
                format: 'vinyl'
            });

            const requestCall = requestSpy.mock.calls[0][0];
            expect(requestCall).toContain(encodeURIComponent('test album'));
            expect(requestCall).toContain('type=release');
            expect(requestCall).toContain('format=vinyl');
        });
    });
});
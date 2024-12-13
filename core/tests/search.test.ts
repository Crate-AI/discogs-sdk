import { describe, it, expect, beforeEach } from 'vitest';
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

        const config = createTestConfig({
            storage,
            httpClient,
            DiscogsConsumerKey: 'test_consumer_key',
            DiscogsConsumerSecret: 'test_consumer_secret'
        });

        sdk = new BaseImplementation(config);
        search = new Search(sdk);

        // Set up mock tokens in storage
        await storage.setItem('accessToken', 'test_access_token');
        await storage.setItem('accessTokenSecret', 'test_access_secret');
        await storage.setItem('requestTokenSecret', 'test_request_secret');
    });

    it('should search releases', async () => {
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
    });

    it('should handle search with multiple parameters', async () => {
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
}); 
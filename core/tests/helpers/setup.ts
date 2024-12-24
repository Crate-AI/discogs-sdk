import { Config, DiscogsSDK } from '../../src';
import { MockStorageAdapter } from '../__mocks__/mockStorage';
import { MockHttpClient } from '../__mocks__/mockHttpClient';
import { DefaultOAuthHandler } from '../../src/implementations/DefaultOAuthHandler';
import { DefaultTokenManager } from '../../src/implementations/DefaultTokenManager';

export function createTestConfig(overrides: Partial<Config> = {}): Config {
  const storage = overrides.storage || new MockStorageAdapter();
  const httpClient = overrides.httpClient || new MockHttpClient();

  return {
    DiscogsConsumerKey: 'test-key',
    DiscogsConsumerSecret: 'test-secret',
    callbackUrl: 'http://localhost:4567/callback',
    userAgent: 'TestAgent/1.0',
    baseUrl: 'https://api.discogs.com',
    storage,
    httpClient,
    tokenManager: new DefaultTokenManager(storage),
    oauthHandler: new DefaultOAuthHandler({
      consumerKey: 'test-key',
      consumerSecret: 'test-secret',
      callbackUrl: 'http://localhost:4567/callback',
      storage,
      httpClient,
      onStateChange: undefined,
    }),
    ...overrides,
  };
}

export function createTestSDK(config: Partial<Config> = {}): DiscogsSDK {
  return new DiscogsSDK(createTestConfig(config));
}

// Helper functions for creating mock responses
export interface MockOAuthResponse {
  ok: boolean;
  status: number;
  data: {
    oauth_token: string;
    oauth_token_secret: string;
  } | null;
}

export function createMockOAuthResponse(
  token: string,
  secret: string,
): MockOAuthResponse {
  return {
    ok: true,
    status: 200,
    data: {
      oauth_token: token,
      oauth_token_secret: secret,
    },
  };
}

export function createMockErrorResponse(status: number): MockOAuthResponse {
  return {
    ok: false,
    status,
    data: null,
  };
}

// Helper function to set up mock responses
export function setupMockResponses(mockHttpClient: MockHttpClient) {
  // Set up request token response
  mockHttpClient.setMockResponse(
    'oauth/request_token',
    createMockOAuthResponse('test_token', 'test_secret'),
  );

  // Set up access token response
  mockHttpClient.setMockResponse(
    'oauth/access_token',
    createMockOAuthResponse('test_access_token', 'test_access_secret'),
  );
}

// Helper function to verify storage state
export async function verifyStorageState(
  storage: MockStorageAdapter,
  expected: Record<string, string>,
) {
  for (const [key, value] of Object.entries(expected)) {
    const storedValue = await storage.getItem(key);
    if (storedValue !== value) {
      throw new Error(
        `Storage mismatch for ${key}: expected ${value}, got ${storedValue}`,
      );
    }
  }
}

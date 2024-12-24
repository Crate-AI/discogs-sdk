import { HttpClient } from '../../src/interfaces/http';
import { DiscogsError, ErrorCodes } from '../../src/utils/errors';

interface MockResponse {
  ok: boolean;
  status: number;
  data: any;
}

export class MockHttpClient implements HttpClient {
  private mockResponses = new Map<string, MockResponse>();
  private lastRequest: {
    url: string;
    method?: string;
    headers: Record<string, string>;
  } | null = null;

  private normalizeHeaders(
    headers: HeadersInit | undefined,
  ): Record<string, string> {
    const normalized: Record<string, string> = {};

    if (!headers) {
      return normalized;
    }

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        normalized[key.toLowerCase()] = value;
      });
      return normalized;
    }

    if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        normalized[key.toLowerCase()] = value;
      });
      return normalized;
    }

    // Handle plain object
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        normalized[key.toLowerCase()] = value;
      }
    });

    return normalized;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;

    this.lastRequest = {
      url: normalizedEndpoint,
      method: options.method,
      headers: this.normalizeHeaders(options.headers),
    };

    let response = this.mockResponses.get(normalizedEndpoint);
    if (!response) {
      const [baseEndpoint] = normalizedEndpoint.split('?');
      response = this.mockResponses.get(baseEndpoint);
    }

    if (!response) {
      throw new DiscogsError(
        `No mock response set for endpoint: ${normalizedEndpoint}`,
        ErrorCodes.NETWORK_ERROR,
      );
    }

    if (!response.ok) {
      throw new DiscogsError(
        `HTTP error ${response.status}: ${response.data || 'Unknown error'}`,
        ErrorCodes.NETWORK_ERROR,
      );
    }

    return response.data as T;
  }

  public getLastRequest() {
    return this.lastRequest
      ? {
          ...this.lastRequest,
          headers: { ...this.lastRequest.headers },
        }
      : null;
  }

  public clearMocks(): void {
    this.mockResponses.clear();
    this.lastRequest = null;
  }

  public setMockResponse(endpoint: string, mock: MockResponse): void {
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    this.mockResponses.set(normalizedEndpoint, mock);
  }
}

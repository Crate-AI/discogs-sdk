import { HttpClient } from '../interfaces/http';
import { DiscogsError, ErrorCodes } from '../utils/errors';

export class DefaultHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly userAgent: string,
  ) {}

  async request<T>(
    endpoint: string,
    options?: RequestInit,
    body?: any,
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

      const headers = new Headers(options?.headers);
      headers.set('User-Agent', this.userAgent);

      const requestOptions: RequestInit = {
        ...options,
        headers,
        body,
      };

      const response = await fetch(url, requestOptions);
      const responseText = await response.text();

      if (!response.ok) {
        throw new DiscogsError(
          `HTTP error ${response.status}: ${responseText}`,
          ErrorCodes.NETWORK_ERROR,
        );
      }

      // Handle different response types
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        return JSON.parse(responseText);
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(responseText);
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
          result[key] = value;
        });
        return result as unknown as T;
      } else {
        return responseText as unknown as T;
      }
    } catch (error) {
      if (error instanceof DiscogsError) {
        throw error;
      }
      throw new DiscogsError(
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCodes.NETWORK_ERROR,
        error,
      );
    }
  }
}

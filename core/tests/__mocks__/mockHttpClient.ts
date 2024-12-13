// tests/__mocks__/mockHttpClient.ts
import { HttpClient } from '../../src/interfaces/http';
import { DiscogsError, ErrorCodes } from '../../src/utils/errors';

interface MockResponse {
    ok: boolean;
    status: number;
    data: any;
}

export class MockHttpClient implements HttpClient {
    private mockResponses = new Map<string, MockResponse>();

    public setMockResponse(endpoint: string, mock: MockResponse): void {
        // Normalize the endpoint by removing leading slash if present
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        this.mockResponses.set(normalizedEndpoint, mock);
    }

    public async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        // Normalize the endpoint by removing leading slash if present
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        
        // Try exact match first
        let response = this.mockResponses.get(normalizedEndpoint);
        
        // If no exact match, try matching the base endpoint without query params
        if (!response) {
            const [baseEndpoint] = normalizedEndpoint.split('?');
            response = this.mockResponses.get(baseEndpoint);
        }
        
        if (!response) {
            throw new DiscogsError(
                `No mock response set for endpoint: ${normalizedEndpoint}`,
                ErrorCodes.NETWORK_ERROR
            );
        }

        if (!response.ok) {
            throw new DiscogsError(
                `HTTP error ${response.status}: ${response.data || 'Unknown error'}`,
                ErrorCodes.NETWORK_ERROR
            );
        }

        return response.data as T;
    }

    public clearMocks(): void {
        this.mockResponses.clear();
    }

    public getMocks(): Map<string, MockResponse> {
        return this.mockResponses;
    }
}
export interface HttpClient {
  request<T>(endpoint: string, options?: RequestInit, body?: any): Promise<T>;
}

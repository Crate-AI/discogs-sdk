export interface TokenManager {
    getAccessToken(): Promise<string | null>;
    setAccessToken(token: string): Promise<void>;
    getRequestToken(): Promise<string | null>;
    setRequestToken(token: string): Promise<void>;
    getRequestTokenSecret(): Promise<string | null>;
    setRequestTokenSecret(secret: string): Promise<void>;
    getAccessTokenSecret(): Promise<string | null>;
    setAccessTokenSecret(secret: string): Promise<void>;
    clearTokens(): Promise<void>;
}
export interface TokenManager {
    getAccessToken(): string | null;
    setAccessToken(token: string): void;
    getRequestToken(): string | null;
    setRequestToken(token: string): void;
    getRequestTokenSecret(): string | null;
    setRequestTokenSecret(secret: string): void;
    getAccessTokenSecret(): string | null;
    setAccessTokenSecret(secret: string): void;
    clearTokens(): void;
}
import { StorageAdapter } from '../interfaces/storage';
import { TokenManager } from '../interfaces/token';

export class DefaultTokenManager implements TokenManager {
    constructor(private storage: StorageAdapter) {}

    getAccessToken(): string | null {
        return this.storage.getItem('accessToken');
    }

    setAccessToken(token: string): void {
        this.storage.setItem('accessToken', token);
    }

    getRequestToken(): string | null {
        return this.storage.getItem('requestToken');
    }

    setRequestToken(token: string): void {
        this.storage.setItem('requestToken', token);
    }

    getRequestTokenSecret(): string | null {
        return this.storage.getItem('requestTokenSecret');
    }

    setRequestTokenSecret(secret: string): void {
        this.storage.setItem('requestTokenSecret', secret);
    }

    getAccessTokenSecret(): string | null {
        return this.storage.getItem('accessTokenSecret');
    }

    setAccessTokenSecret(secret: string): void {
        this.storage.setItem('accessTokenSecret', secret);
    }

    clearTokens(): void {
        this.storage.removeItem('accessToken');
        this.storage.removeItem('requestToken');
        this.storage.removeItem('requestTokenSecret');
        this.storage.removeItem('accessTokenSecret');
    }
}
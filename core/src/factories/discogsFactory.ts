// factories/discogsFactory.ts
import { Config, BaseImplementation } from '../base';
import { StorageAdapter } from '../interfaces/storage';
import { MemoryStorageAdapter } from '../adapters/memoryStorage';
import { DefaultHttpClient } from '../implementations/DefaultHttpClient';
import { DefaultOAuthHandler } from '../implementations/DefaultOAuthHandler';
import { DefaultTokenManager } from '../implementations/DefaultTokenManager';

export interface DiscogsSDKConfig {
    DiscogsConsumerKey: string;
    DiscogsConsumerSecret: string;
    baseUrl?: string;
    callbackUrl?: string;
    userAgent?: string;
}

export class DiscogsFactory {
    static createDefault(config: DiscogsSDKConfig): BaseImplementation {
        const storage = new MemoryStorageAdapter();
        const httpClient = new DefaultHttpClient(
            config.baseUrl || 'https://api.discogs.com',
            config.userAgent || 'DefaultUserAgent/1.0'
        );
        const tokenManager = new DefaultTokenManager(storage);
        const oauthHandler = new DefaultOAuthHandler({
            consumerKey: config.DiscogsConsumerKey,
            consumerSecret: config.DiscogsConsumerSecret,
            callbackUrl: config.callbackUrl || 'http://localhost:4567/callback',
            storage,
            httpClient,  // Add httpClient to OAuthHandler config
            onStateChange: undefined
        });

        return new BaseImplementation({
            ...config,
            storage,
            httpClient,
            tokenManager,
            oauthHandler
        });
    }

    static createWithCustomStorage(
        config: DiscogsSDKConfig,
        storage: StorageAdapter
    ): BaseImplementation {
        const httpClient = new DefaultHttpClient(
            config.baseUrl || 'https://api.discogs.com',
            config.userAgent || 'DefaultUserAgent/1.0'
        );
        const tokenManager = new DefaultTokenManager(storage);
        const oauthHandler = new DefaultOAuthHandler({
            consumerKey: config.DiscogsConsumerKey,
            consumerSecret: config.DiscogsConsumerSecret,
            callbackUrl: config.callbackUrl || 'http://localhost:4567/callback',
            storage,
            httpClient,  // Add httpClient to OAuthHandler config
            onStateChange: undefined
        });

        return new BaseImplementation({
            ...config,
            storage,
            httpClient,
            tokenManager,
            oauthHandler
        });
    }

    static createWithCustomDependencies(config: Config): BaseImplementation {
        return new BaseImplementation(config);
    }

    // Helper method to create default dependencies
    private static createDefaultDependencies(config: DiscogsSDKConfig) {
        const storage = new MemoryStorageAdapter();
        const httpClient = new DefaultHttpClient(
            config.baseUrl || 'https://api.discogs.com',
            config.userAgent || 'DefaultUserAgent/1.0'
        );
        const tokenManager = new DefaultTokenManager(storage);

        return { storage, httpClient, tokenManager };
    }
}
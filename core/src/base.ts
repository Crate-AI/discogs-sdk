import fetch from 'isomorphic-unfetch';

/**
 * Configuration type for the Base class.
 *
 * @typedef {Object} Config
 * @property {string} DiscogsConsumerKey - The Discogs consumer key.
 * @property {string} DiscogsConsumerSecret - The Discogs consumer secret.
 * @property {string} [baseUrl] - The base URL for the Discogs API. Defaults to 'https://api.discogs.com'.
 * @property {string} [callbackUrl] - The callback URL for the OAuth flow. Defaults to 'http://localhost:3000/callback'.
 * @property {string} [userAgent] - The User-Agent string for the SDK. Defaults to 'DefaultUserAgent/1.0'.
 */
type Config = {
    DiscogsConsumerKey: string;
    DiscogsConsumerSecret: string;
    baseUrl?: string;
    callbackUrl?: string;
    userAgent?: string;
};

/**
 * Abstract Base class for the SDK.
 */
export abstract class Base {
    private DiscogsConsumerKey: string;
    private DiscogsConsumerSecret: string;
    private baseUrl: string;
    private callbackUrl: string;
    private userAgent: string;
    private generateNonce(): string {
        return Date.now().toString() + Math.random().toString().substring(2);
    }
     /**
     * Constructor for the Base class.
     *
     * @param {Config} config - The configuration object.
     */
    constructor(config: Config) {
        this.DiscogsConsumerKey = config.DiscogsConsumerKey;
        this.DiscogsConsumerSecret = config.DiscogsConsumerSecret;
        this.baseUrl = config.baseUrl || 'https://api.discogs.com';
        this.callbackUrl = config.callbackUrl || 'http://localhost:3000/callback';
        this.userAgent = config.userAgent || 'DefaultUserAgent/1.0';
    }

    protected get consumerKey(): string {
        return this.DiscogsConsumerKey;
    }

    protected get consumerSecret(): string {
        return this.DiscogsConsumerSecret;
    }

    protected get callbackUrlGetter(): string {
        return this.callbackUrl;
    }

    protected get baseUrlGetter(): string {
        return this.baseUrl;
    }

    protected get userAgentGetter(): string {
        return this.userAgent;
    }

    protected get nonceGetter(): string {
        return this.generateNonce();
    }

    /**
     * Method to generate the OAuth header.
     *
     * @returns {string} - The generated OAuth header.
     */
    protected generateOAuthHeader(): string {
        const timestamp = Date.now().toString();
        const nonce = this.generateNonce();
        return `OAuth oauth_consumer_key="${this.DiscogsConsumerKey}",oauth_signature_method="PLAINTEXT",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${this.DiscogsConsumerSecret}&"`;
    }

    /**
     * Method to make a request to the Discogs API.
     *
     * @param {string} endpoint - The API endpoint to request.
     * @param {RequestInit} [options] - The request options.
     * @param {any} [body] - The request body.
     * @returns {Promise<T>} - A promise that resolves with the API response.
     */
    protected async request<T>(endpoint: string, options?: RequestInit, body?: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        console.log('url',url);
        const headers = new Headers({
            'Authorization': this.generateOAuthHeader(),
            'User-Agent': this.userAgent
        });

        if (body && typeof body === 'string') {
            headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else if (body) {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }

        const config = {
            headers: headers,
            ...options,
            body: body,
            method: options?.method || 'GET'
        };

        const response = await fetch(url, config);
        if (!response.ok) {
            const responseBody = await response.text();
        throw new Error(`HTTP error ${response.status}: ${responseBody}`);
        }
        // Check response headers to determine how to parse the response
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            return response.json() as Promise<T>;
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await response.text();
            return new URLSearchParams(text) as unknown as Promise<T>;
        } else {
            throw new Error(`Unsupported content type: ${contentType}`);
        }
    }
}
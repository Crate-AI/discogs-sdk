type Config = {
    DiscogsConsumerKey: string;
    DiscogsConsumerSecret: string;
    baseUrl?: string;
    callbackUrl?: string;
    userAgent?: string;
};
export declare abstract class Base {
    private DiscogsConsumerKey;
    private DiscogsConsumerSecret;
    private baseUrl;
    private callbackUrl;
    private userAgent;
    private generateNonce;
    constructor(config: Config);
    protected get consumerKey(): string;
    protected get consumerSecret(): string;
    protected get callbackUrlGetter(): string;
    protected get baseUrlGetter(): string;
    protected get userAgentGetter(): string;
    protected get nonceGetter(): string;
    protected generateOAuthHeader(): string;
    protected request<T>(endpoint: string, options?: RequestInit, body?: any): Promise<T>;
}
export {};

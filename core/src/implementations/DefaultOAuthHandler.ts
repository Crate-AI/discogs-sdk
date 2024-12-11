import { OAuthHandler, OAuthCallbackParams } from '../interfaces/oauth';
import { HttpClient } from '../interfaces/http';
import { TokenManager } from '../interfaces/token';

export class DefaultOAuthHandler implements OAuthHandler {
    private readonly AUTH_BASE_URL = 'https://www.discogs.com/oauth';

    constructor(
        private readonly consumerKey: string,
        private readonly consumerSecret: string,
        private readonly callbackUrl: string,
        private readonly httpClient: HttpClient,
        private readonly tokenManager: TokenManager
    ) {}

    private generateNonce(): string {
        return `${Date.now()}${Math.random().toString().substring(2)}`;
    }

    private generateTimestamp(): string {
        return Math.floor(Date.now() / 1000).toString();
    }

    async getAuthorizationUrl(): Promise<string> {
        const timestamp = this.generateTimestamp();
        const nonce = this.generateNonce();
        const signature = `${this.consumerSecret}&`;

        const authHeader = `OAuth oauth_consumer_key="${this.consumerKey}",` +
            `oauth_nonce="${nonce}",` +
            `oauth_callback="${encodeURIComponent(this.callbackUrl)}",` +
            `oauth_signature="${encodeURIComponent(signature)}",` +
            `oauth_signature_method="PLAINTEXT",` +
            `oauth_timestamp="${timestamp}",` +
            `oauth_version="1.0"`;

        try {
            const response = await this.httpClient.request<Record<string, string>>('oauth/request_token', {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { oauth_token: oauthToken, oauth_token_secret: oauthTokenSecret } = response;

            if (!oauthToken || !oauthTokenSecret) {
                throw new Error('Invalid response: Missing oauth tokens');
            }

            this.tokenManager.setRequestToken(oauthToken);
            this.tokenManager.setRequestTokenSecret(oauthTokenSecret);

            return `${this.AUTH_BASE_URL}/authorize?oauth_token=${oauthToken}`;
        } catch (error) {
            throw new Error(`Failed to obtain request token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleCallback(params: OAuthCallbackParams): Promise<{
        oauthAccessToken: string;
        oauthAccessTokenSecret: string;
    }> {
        const { oauthVerifier } = params;
        const requestToken = this.tokenManager.getRequestToken();
        const requestTokenSecret = this.tokenManager.getRequestTokenSecret();

        if (!requestToken || !requestTokenSecret) {
            throw new Error('Missing request tokens. Authorization process must be initiated first.');
        }

        const body = new URLSearchParams({
            'oauth_token': requestToken,
            'oauth_verifier': oauthVerifier
        }).toString();

        const signature = `${this.consumerSecret}&${requestTokenSecret}`;
        const timestamp = this.generateTimestamp();
        const nonce = this.generateNonce();

        const authHeader = `OAuth oauth_consumer_key="${this.consumerKey}",` +
            `oauth_nonce="${nonce}",` +
            `oauth_signature="${signature}",` +
            `oauth_signature_method="PLAINTEXT",` +
            `oauth_timestamp="${timestamp}",` +
            `oauth_token="${requestToken}",` +
            `oauth_version="1.0"`;

        try {
            const response = await this.httpClient.request<Record<string, string>>('oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader
                }
            }, body);

            const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret } = response;

            if (!accessToken || !accessTokenSecret) {
                throw new Error('Invalid response: Missing access tokens');
            }

            this.tokenManager.setAccessToken(accessToken);
            this.tokenManager.setAccessTokenSecret(accessTokenSecret);

            return {
                oauthAccessToken: accessToken,
                oauthAccessTokenSecret: accessTokenSecret
            };
        } catch (error) {
            throw new Error(`Failed to obtain access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
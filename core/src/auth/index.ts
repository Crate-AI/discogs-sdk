import { BaseImplementation } from "../base";
import { 
    UserIdentityResponse, 
    UserIdentityParams,
    RequestTokenResponse,
    AccessTokenResponse,
    AccessTokenParams 
} from "./types";
import http from 'http';
import url from 'url';

export class Auth {
    constructor(public readonly base: BaseImplementation) {}

    async getAuthorizationUrl(): Promise<string> {
        const oauthHandler = this.base.getOAuthHandler();
        return await oauthHandler.getAuthorizationUrl();
    }

    // Direct OAuth flow methods
    async getRequestToken(): Promise<RequestTokenResponse> {
        const oauthHandler = this.base.getOAuthHandler();
        const tokenManager = this.base.getTokenManager();
        
        const authorizationUrl = await oauthHandler.getAuthorizationUrl();
        const requestToken = tokenManager.getRequestToken();
        const requestTokenSecret = tokenManager.getRequestTokenSecret();

        if (!requestToken || !requestTokenSecret) {
            throw new Error('Failed to obtain request tokens');
        }

        return {
            oauthRequestToken: requestToken,
            oauthRequestTokenSecret: requestTokenSecret,
            verificationURL: authorizationUrl
        };
    }

    async handleCallback(params: AccessTokenParams): Promise<AccessTokenResponse> {
        const oauthHandler = this.base.getOAuthHandler();
        const tokenManager = this.base.getTokenManager();
        
        const accessTokenResponse = await oauthHandler.handleCallback({
            oauthVerifier: params.oauthVerifier,
            oauthToken: params.oauthToken,
            oauthTokenSecret: params.tokenSecret
        });

        tokenManager.setAccessToken(accessTokenResponse.oauthAccessToken);
        tokenManager.setAccessTokenSecret(accessTokenResponse.oauthAccessTokenSecret);

        return accessTokenResponse;
    }

    // CLI-style authentication
    async authenticate(): Promise<void> {
        try {
            const oauthHandler = this.base.getOAuthHandler();
            const tokenManager = this.base.getTokenManager();
            
            const authUrl = await oauthHandler.getAuthorizationUrl();
            console.log(`Please visit this URL to authorize the application:\n\n${authUrl}`);
    
            const oauthVerifier = await this.getOAuthVerifier();
    
            const accessTokenResponse = await oauthHandler.handleCallback({
                oauthVerifier,
                oauthToken: tokenManager.getRequestToken() || '',
                oauthTokenSecret: tokenManager.getRequestTokenSecret() || ''
            });

            tokenManager.setAccessToken(accessTokenResponse.oauthAccessToken);
            tokenManager.setAccessTokenSecret(accessTokenResponse.oauthAccessTokenSecret);
    
            console.log('Authentication successful!');
        } catch (error) {
            console.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    async getUserIdentity(params?: UserIdentityParams): Promise<UserIdentityResponse> {
        try {
            const tokenManager = this.base.getTokenManager();
            const oauthToken = params?.oauthToken || tokenManager.getAccessToken();
            const oauthTokenSecret = params?.oauthTokenSecret || tokenManager.getAccessTokenSecret();
    
            if (!oauthToken || !oauthTokenSecret) {
                throw new Error('Authentication required. Please authenticate first.');
            }
            
            const authHeader = this.base.generateOAuthHeaderPublic(oauthToken, oauthTokenSecret);
            const headers = {
                'Authorization': authHeader,
                'User-Agent': this.base.getUserAgent()
            };
    
            const identity = await this.base.requestPublic<UserIdentityResponse>('oauth/identity', {
                method: 'GET',
                headers
            });
    
            this.base.getStorage().setItem('userIdentity', JSON.stringify(identity));
            
            return identity;
        } catch(error) {
            throw new Error(`Failed to fetch user identity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async getOAuthVerifier(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let serverStarted = false;
            const server = http.createServer((req, res) => {
                if (!req.url) {
                    return reject(new Error('No URL in request'));
                }
    
                const queryObject = url.parse(req.url, true).query;
                const oauthVerifier = queryObject['oauth_verifier'];
    
                if (!oauthVerifier || typeof oauthVerifier !== 'string') {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Missing oauth_verifier');
                    server.close();
                    return reject(new Error('Missing oauth_verifier'));
                }
    
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Authentication Successful</title>
                    </head>
                    <body>
                        <p>Authentication successful! You can close this window.</p>
                    </body>
                    </html>
                `);
    
                server.close(() => {
                    console.log('Server closed successfully');
                });
                resolve(oauthVerifier);
            });
    
            server.on('error', (err) => {
                if (!serverStarted) {
                    reject(err);
                }
            });
    
            server.listen(4567, () => {
                serverStarted = true;
                console.log('Waiting for OAuth callback on port 4567...');
            });
    
            setTimeout(() => {
                if (server.listening) {
                    server.close();
                    reject(new Error('OAuth verification timeout after 5 minutes'));
                }
            }, 5 * 60 * 1000);
        });
    }
}
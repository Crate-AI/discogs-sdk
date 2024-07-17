import { Base, Config } from "../base";
import { RequestTokenResponse, AccessTokenResponse, AccessTokenParams, UserIdentityResponse, UserIdentityParams } from "./types";
import { StorageService } from '../utils';
import http from 'http';
import url from 'url';

export class Auth extends Base {
    constructor(config: Config) {
        super(config);
    }

    async authenticate(): Promise<void> {
        try {
            console.log('Discogs Authentication');
            const requestTokenResponse = await this.getRequestToken();
            const authUrl = requestTokenResponse.verificationURL;

            console.log(`Please visit this URL to authorize the application:\n\n${authUrl}`);

            const oauthVerifier = await this.getOAuthVerifier();
            const accessTokenResponse = await this.getAccessToken({
                oauthToken: requestTokenResponse.oauthRequestToken,
                tokenSecret: requestTokenResponse.oauthRequestTokenSecret,
                oauthVerifier: oauthVerifier
            });

            StorageService.setItem('oauthAccessToken', accessTokenResponse.oauthAccessToken);
            StorageService.setItem('oauthAccessTokenSecret', accessTokenResponse.oauthAccessTokenSecret);
            console.log('Authentication successful!');
        } catch (error) {
            console.error(`Authentication failed due to error: ${error.message || error}`);
        }
    }

    private createVerificationURL(token: string): string {
        const url = `https://www.discogs.com/oauth/authorize?oauth_token=${token}`;
        return url;
    }

    async getRequestToken(callbackUrl?: string): Promise<RequestTokenResponse> {
        const timestamp = this.generateTimestamp();
        const nonce = this.nonceGetter;
        const body = new URLSearchParams({
            'oauth_callback': callbackUrl? callbackUrl : 'http://localhost:4567/callback',
            'oauth_consumer_key': this.consumerKey,
            'oauth_nonce': nonce,
            'oauth_signature_method': 'PLAINTEXT',
            'oauth_timestamp': timestamp,
            'oauth_version': '1.0',
        }).toString();
    
        const responseParams = await this.request<Record<string, string>>('oauth/request_token', {
            method: 'POST'
        }, body);
    
        const oauth_token = responseParams['oauth_token'];
        const oauth_token_secret = responseParams['oauth_token_secret'];
        const verificationURL = `https://www.discogs.com/oauth/authorize?oauth_token=${oauth_token}`;

        const returnResponse = {
            oauthRequestToken: oauth_token,
            oauthRequestTokenSecret: oauth_token_secret,
            verificationURL: verificationURL
        };
    
        StorageService.setItem('oauthRequestTokenSecret', oauth_token_secret);
        return returnResponse;
    }

    async getAccessToken(params: AccessTokenParams): Promise<AccessTokenResponse> {
        const timestamp = this.generateTimestamp();
        const nonce = this.nonceGetter;
    
        const body = new URLSearchParams({
            'oauth_token': params.oauthToken,
            'oauth_verifier': params.oauthVerifier
        }).toString();
        const authorizationHeader = this.generateOAuthHeader(params.oauthToken, params.tokenSecret);
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authorizationHeader,
                'User-Agent': this.userAgentGetter
            }
        };
        
        const response = await this.request<string>('oauth/access_token', options, body);
        
        console.log('Raw response:', response);
    
        const responseParams = new URLSearchParams(response);
        if (!responseParams.get('oauth_token')) {
            throw new Error('Unable to retrieve access token. Your request token may have expired.');
        }
        return {
            oauthAccessToken: responseParams.get('oauth_token')!,
            oauthAccessTokenSecret: responseParams.get('oauth_token_secret')!
        };
    }

    async getUserIdentity(params: UserIdentityParams): Promise<UserIdentityResponse> {
        const oauthToken = params.oauthToken || StorageService.getItem('oauthAccessToken');
        const oauthTokenSecret = params.oauthTokenSecret || StorageService.getItem('oauthAccessTokenSecret');
        const endpoint = 'oauth/identity';
        const authorizationHeader = this.generateOAuthHeader(oauthToken, oauthTokenSecret);

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authorizationHeader,
            'User-Agent': this.userAgentGetter
        };
        const options = {
            method: 'GET',
            headers: headers
        };
        const response = await this.request<UserIdentityResponse>(endpoint, options);
        StorageService.setItem('userIdentity', response);
        return response;
    }

    async getOAuthVerifier(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const server = http.createServer((req, res) => {
                if (req.url) {
                    const queryObject = url.parse(req.url, true).query;
                    const oauthVerifier = queryObject['oauth_verifier'] as string | undefined;

                    if (!oauthVerifier) {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Missing oauth_verifier');
                        reject(new Error('Missing oauth_verifier'));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Auto Close Window</title>
                        </head>
                        <body>
                            <p>Authentication successful! This window will close in <span id="seconds">5</span> seconds.</p>
                            <script>
                                let seconds = 5;
                                const countdownElement = document.getElementById('seconds');

                                const countdown = setInterval(() => {
                                    seconds--;
                                    countdownElement.textContent = seconds;
                                    if (seconds <= 0) {
                                        clearInterval(countdown);
                                        document.body.innerHTML = '<p>You can close this window now.</p>';
                                    }
                                }, 1000);
                            </script>
                        </body>
                        </html>
                    `);
                    server.close();
                    resolve(oauthVerifier);
                }
            });

            server.listen(4567, () => {
                // Server listening on port 4567
            });
        });
    }
}
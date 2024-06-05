import { Base, Config } from "../base";
import { RequestTokenResponse, AccessTokenResponse, AccessTokenParams, UserIdentityResponse, UserIdentityParams } from "./types";
import { setTimeout as sleep } from 'node:timers/promises';
import { StorageService } from '../utils';
import {
  intro,
  outro,
  text,
  note,
  confirm,
  isCancel,
  cancel,
  spinner
} from '@clack/prompts';
import colors from 'picocolors';
import http from 'http';
import url from 'url';

export class Auth extends Base {

    constructor(config: Config) {
        super(config);
    }

    async authenticate(): Promise<void> {
        try {
            console.log('\n');
            intro(colors.bgBlue('Discogs Authentication'));
            const requestTokenResponse = await this.getRequestToken();
            const authUrl = requestTokenResponse.verificationURL;

            const openBrowser = await confirm({
                message: 'Would you like to open the authorization URL in your browser automatically?',
            });

            if (isCancel(openBrowser)) {
                cancel('Operation cancelled');
                return;
            }

            if (openBrowser) {
                const { default: open } = await import('open');
                await open(authUrl);
                note(`Opening this URL in your browser for authorization...`, 'Authorization URL');
            } else {
                note(`Please visit this URL to authorize the application:\n\n${authUrl}`, 'Authorization URL');
            }

            const authSpinner = spinner();
            authSpinner.start('Waiting for authorization...');

            const oauthVerifier = await this.getOAuthVerifier();

            authSpinner.stop('Authorization completed.');

            const accessTokenResponse = await this.getAccessToken({
                oauthToken: requestTokenResponse.oauthRequestToken,
                tokenSecret: requestTokenResponse.oauthRequestTokenSecret,
                oauthVerifier: oauthVerifier
            });

            StorageService.setItem('oauthAccessToken', accessTokenResponse.oauthAccessToken);
            StorageService.setItem('oauthAccessTokenSecret', accessTokenResponse.oauthAccessTokenSecret);
            outro('Authentication successful!');
        } catch (error) {
            const errorMessage = `Authentication failed due to error: ${error.message || error}`;
            note(`${errorMessage}\n\nPlease check your input and try again.`, 'Error');
            cancel('Operation cancelled due to error.');
        }
    }

    private createVerificationURL(token: string): string {
        return `https://www.discogs.com/oauth/authorize?oauth_token=${token}`;
    }

    async getRequestToken(): Promise<RequestTokenResponse> {
        const timestamp = this.generateTimestamp();
        const nonce = this.nonceGetter;
        const body = new URLSearchParams({
            'oauth_callback': 'http://localhost:4567/callback',
            'oauth_consumer_key': this.consumerKey,
            'oauth_nonce': nonce,
            'oauth_signature_method': 'PLAINTEXT',
            'oauth_timestamp': timestamp,
            'oauth_version': '1.0',
        }).toString();

        const data = await this.request<URLSearchParams>('oauth/request_token', {
            method: 'POST'
        }, body);

        StorageService.setItem('oauthRequestTokenSecret', data.get('oauth_token_secret')!); // Store the token secret

        return {
            oauthRequestToken: data.get('oauth_token')!,
            oauthRequestTokenSecret: data.get('oauth_token_secret')!,
            verificationURL: this.createVerificationURL(data.get('oauth_token')!)
        };
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
        const response = await this.request<URLSearchParams>('oauth/access_token', options, body);
        if (!response.get('oauth_token')) {
            throw new Error('Unable to retrieve access token. Your request token may have expired.');
        }
        return {
            oauthAccessToken: response.get('oauth_token')!,
            oauthAccessTokenSecret: response.get('oauth_token_secret')!
        };
    }

    async getUserIdentity(params: UserIdentityParams): Promise<UserIdentityResponse> {
        const oauthToken = params.oauthToken || StorageService.getItem('oauthAccessToken');
        const oauthTokenSecret = params.oauthTokenSecret || StorageService.getItem('oauthAccessTokenSecret');
        const endpoint = 'oauth/identity';  // Remove the leading slash to ensure no double slash with base URL
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

    async authenticateAndGetIdentity(): Promise<UserIdentityResponse | AccessTokenResponse> {
        try {
            intro('Discogs Authentication');
            const requestToken = await this.getRequestToken();
            const authUrl = requestToken.verificationURL;

            const openBrowser = await confirm({
                message: 'Would you like to open the authorization URL in your browser automatically?',
            });

            if (isCancel(openBrowser)) {
                cancel('Operation cancelled');
                return;
            }

            if (openBrowser) {
                const { default: open } = await import('open');
                await open(authUrl);
                note(`Opening this URL in your browser for authorization...`, 'Authorization URL');
            } else {
                note(`Please visit this URL to authorize the application:\n\n${authUrl}`, 'Authorization URL');
            }

            const authSpinner = spinner();
            authSpinner.start('Waiting for authorization...');

            const oauthVerifier = await this.getOAuthVerifier();

            authSpinner.stop('Authorization completed.');

            const accessToken = await this.getAccessToken({
                oauthToken: requestToken.oauthRequestToken,
                tokenSecret: requestToken.oauthRequestTokenSecret,
                oauthVerifier: oauthVerifier
            });

            StorageService.setItem('oauthAccessToken', accessToken.oauthAccessToken);
            StorageService.setItem('oauthAccessTokenSecret', accessToken.oauthAccessTokenSecret);

            const userIdentity: UserIdentityResponse = await this.getUserIdentity({
                oauthToken: StorageService.getItem('oauthAccessToken'),
                oauthTokenSecret: StorageService.getItem('oauthAccessTokenSecret')
            });

            StorageService.setItem('userIdentity', userIdentity);

            outro('Authentication successful!');
            return userIdentity;
        } catch (error) {
            const errorMessage = `Authentication flow failed due to error: ${error.message || error}`;
            note(`${errorMessage}\n\nPlease check your input and try again.`, 'Error');
            cancel('Operation cancelled due to error.');
            throw error;
        }
    }

    private async getOAuthVerifier(): Promise<string> {
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
                            <p>Authentication successful! This window will close  in <span id="seconds">5</span> seconds.</p>
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

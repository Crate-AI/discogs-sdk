import { Base } from "../base";
import { RequestTokenResponse, AccessTokenResponse, AccessTokenParams, UserIdentityResponse, UserIdentityParams } from "./types";
import { createInterface } from 'readline';
import { StorageService } from '../utils';

export class Auth extends Base {
    constructor(config) {
        super(config);
    }

    async authenticate(): Promise<void> {
        const requestTokenResponse = await this.getRequestToken();
        console.log(`Please visit this URL to authorize the application: ${requestTokenResponse.verificationURL}`);

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const oauthVerifier = await new Promise<string>((resolve) => {
            rl.question('Please enter the OAuth verifier: ', (verifier) => {
                rl.close();
                resolve(verifier);
            });
        });

        const accessTokenResponse = await this.getAccessToken({
            oauthToken: requestTokenResponse.oauthRequestToken,
            tokenSecret: requestTokenResponse.oauthRequestTokenSecret,
            oauthVerifier: oauthVerifier
        });
        StorageService.setItem('oauthAccessToken', accessTokenResponse.oauthAccessToken);
        StorageService.setItem('oauthAccessTokenSecret', accessTokenResponse.oauthAccessTokenSecret);
    }
    /**
     * Method to create a verification URL for OAuth1.
     * @param {string} token - The OAuth request token.
     * @returns {string} - The verification URL.
     */
    private createVerificationURL(token: string): string {
        return `https://www.discogs.com/oauth/authorize?oauth_token=${token}`;
    }

    /**
     * Method to obtain the request token for OAuth1.
     * @returns {Promise<RequestTokenResponse>} - A promise that resolves with the request token object.
     */
    async getRequestToken(): Promise<RequestTokenResponse> {
        const timestamp = this.generateTimestamp();
        const nonce = this.nonceGetter;
        const body = new URLSearchParams({
            'oauth_callback': this.callbackUrlGetter,
            'oauth_consumer_key': this.consumerKey,
            'oauth_nonce': nonce,
            'oauth_signature_method': 'PLAINTEXT',
            'oauth_timestamp': timestamp,
            'oauth_version': '1.0',
        }).toString();

        const data = await this.request<URLSearchParams>('oauth/request_token', {
            method: 'POST'
        }, body);

        return {
            oauthRequestToken: data.get('oauth_token')!,
            oauthRequestTokenSecret: data.get('oauth_token_secret')!,
            verificationURL: this.createVerificationURL(data.get('oauth_token')!)
        };
    }

    /**
     * Method to obtain the access token for OAuth1.
     * @param {AccessTokenParams} params - The parameters for the access token request.
     * @returns {Promise<AccessTokenResponse>} - A promise that resolves with the access token object.
     */
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
        return {
            oauthAccessToken: response.get('oauth_token')!,
            oauthAccessTokenSecret: response.get('oauth_token_secret')!
        };
    }

    /**
     * Method to obtain the user identity for OAuth1.
     * @param {string} oauthToken - The OAuth access token.
     * @param {string} oauthTokenSecret - The OAuth access token secret.
     * @returns {Promise<UserIdentity>} - A promise that resolves with the user identity object.
     */
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

    /**
     * Method to coordinate the complete OAuth authentication flow.
     * @returns {Promise<UserIdentityResponse | AccessTokenResponse>} - Depending on whether user identity is fetched.
     */
    async authenticateAndGetIdentity(): Promise<UserIdentityResponse | AccessTokenResponse> {
        try {
            const requestToken = await this.getRequestToken();
            console.log(`Please visit this URL to authorize the application: ${requestToken.verificationURL}`);
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });
    
            const oauthVerifier = await new Promise<string>((resolve) => {
                rl.question('Please enter the OAuth verifier: ', (verifier) => {
                    rl.close();
                    resolve(verifier);
                });
            });
    
            const accessToken = await this.getAccessToken({
                oauthToken: requestToken.oauthRequestToken,
                tokenSecret: requestToken.oauthRequestTokenSecret,
                oauthVerifier: oauthVerifier
            });
    
            // Store access token and secret
            StorageService.setItem('oauthAccessToken', accessToken.oauthAccessToken);
            StorageService.setItem('oauthAccessTokenSecret', accessToken.oauthAccessTokenSecret);
    
            const userIdentity: UserIdentityResponse = await this.getUserIdentity({
                oauthToken: accessToken.oauthAccessToken,
                oauthTokenSecret: accessToken.oauthAccessTokenSecret
            });
    
            // Optionally store user identity as well
            StorageService.setItem('userIdentity', userIdentity);
    
            return userIdentity;
        } catch (error) {
            console.error('Authentication flow failed:', error);
            throw error;
        }
    }
    
    
}


import { Base, Config } from "../base";
import { RequestTokenResponse, AccessTokenResponse, AccessTokenParams, UserIdentityResponse, UserIdentityParams } from "./types";
import { setTimeout as sleep } from 'node:timers/promises';
import { StorageService } from '../utils';
import {
  intro,
  outro,
  text,
  note,
  isCancel,
  cancel
} from '@clack/prompts';

export class Auth extends Base {

    constructor(config: Config) {
        super(config);
    }

    async authenticate(): Promise<void> {
        intro('Discogs Authentication');
        const requestTokenResponse = await this.getRequestToken();
        note(`Please visit this URL to authorize the application:\n\n${requestTokenResponse.verificationURL}`, 'Authorization URL');

        const oauthVerifier = await text({
            message: 'Please enter the OAuth verifier:'
        });

        if (isCancel(oauthVerifier)) {
            cancel('Operation cancelled');
            return;
        }

        const accessTokenResponse = await this.getAccessToken({
            oauthToken: requestTokenResponse.oauthRequestToken,
            tokenSecret: requestTokenResponse.oauthRequestTokenSecret,
            oauthVerifier: oauthVerifier
        });

        StorageService.setItem('oauthAccessToken', accessTokenResponse.oauthAccessToken);
        StorageService.setItem('oauthAccessTokenSecret', accessTokenResponse.oauthAccessTokenSecret);
        outro('Authentication successful!');
    }

    private createVerificationURL(token: string): string {
        return `https://www.discogs.com/oauth/authorize?oauth_token=${token}`;
    }

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
            note(`Please visit this URL to authorize the application:\n\n${requestToken.verificationURL}`, 'Authorization URL');

            const oauthVerifier = await text({
                message: 'Please enter the OAuth verifier:'
            });

            if (isCancel(oauthVerifier)) {
                cancel('Operation cancelled');
                return;
            }

            const accessToken = await this.getAccessToken({
                oauthToken: requestToken.oauthRequestToken,
                tokenSecret: requestToken.oauthRequestTokenSecret,
                oauthVerifier: oauthVerifier
            });

            StorageService.setItem('oauthAccessToken', accessToken.oauthAccessToken);
            StorageService.setItem('oauthAccessTokenSecret', accessToken.oauthAccessTokenSecret);

            const userIdentity: UserIdentityResponse = await this.getUserIdentity({
                oauthToken: accessToken.oauthAccessToken,
                oauthTokenSecret: accessToken.oauthAccessTokenSecret
            });

            StorageService.setItem('userIdentity', userIdentity);

            outro('Authentication successful!');
            return userIdentity;
        } catch (error) {
            console.error('Authentication flow failed:', error);
            throw error;
        }
    }
}

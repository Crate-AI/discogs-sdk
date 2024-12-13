import { HttpClient } from 'src/interfaces/http';
import { OAuthState, OAuthTokenPair } from '../interfaces/oauth';
import { StorageAdapter } from 'src/interfaces/storage';

export interface RequestTokenResponse {
    verificationURL: string;
    requestTokens: OAuthTokenPair;
}

export interface AccessTokenParams {
    oauthVerifier: string;
    oauthToken: string;
}

export interface UserIdentityResponse {
    id: number;
    username: string;
    resource_url: string;
    consumer_name: string;
}

export interface CallbackConfig {
    port?: number;
    host?: string;
    path?: string;
    timeout?: number;
    customSuccessHtml?: string;
}



export { OAuthTokenPair } from '../interfaces/oauth';
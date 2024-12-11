export interface OAuthCallbackParams {
    oauthVerifier: string;
    oauthToken: string;
    oauthTokenSecret: string;
  }

export interface OAuthHandler {
    getAuthorizationUrl(): Promise<string>;
    handleCallback(params: OAuthCallbackParams): Promise<any>;
  }
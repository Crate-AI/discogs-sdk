export declare type RequestTokenResponse = {
    oauthRequestToken: string;
    oauthRequestTokenSecret: string;
    verificationURL: string;
};
export declare type AccessTokenParams = {
    oauthToken: string;
    oauthVerifier: string;
    tokenSecret: string;
};
export declare type AccessTokenResponse = {
    oauthAccessToken: string;
    oauthAccessTokenSecret: string;
};
export declare type UserIdentityParams = {
    oauthToken: string;
    oauthTokenSecret: string;
};
export declare type UserIdentityResponse = {
    id: number;
    username: string;
    resource_url: string;
    consumerName: string;
};

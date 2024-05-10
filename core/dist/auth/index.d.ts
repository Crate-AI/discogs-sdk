import { Base } from "../base";
import { RequestTokenResponse, AccessTokenResponse, AccessTokenParams, UserIdentityResponse, UserIdentityParams } from "./types";
export declare class Auth extends Base {
    private generateTimestamp;
    private createVerificationURL;
    getRequestToken(): Promise<RequestTokenResponse>;
    getAccessToken(params: AccessTokenParams): Promise<AccessTokenResponse>;
    getUserIdentity(params: UserIdentityParams): Promise<UserIdentityResponse>;
    authenticateAndGetIdentity(): Promise<UserIdentityResponse | AccessTokenResponse>;
}

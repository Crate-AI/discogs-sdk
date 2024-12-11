import { BaseImplementation } from "../base";
import type { CollectionResponse, CollectionParams } from "./types";
import type { UserIdentityResponse } from "../auth/types";

export class Collection {
    constructor(private readonly base: BaseImplementation) {}

    async getCollection(params: CollectionParams): Promise<CollectionResponse> {
        const tokenManager = this.base.getTokenManager();
        const oauthToken = tokenManager.getAccessToken();
        const oauthTokenSecret = tokenManager.getRequestTokenSecret();
    
        // Get user identity from storage adapter
        const storage = this.base.getStorage();
        const userIdentity = storage.getItem('userIdentity') as UserIdentityResponse;
        
        const {
            folderId = 0,
            page = 1,
            perPage = 50,
            username = userIdentity?.username
        } = params;
    
        if (!username) {
            throw new Error('Username is required to fetch collection');
        }
    
        const queryParams = new URLSearchParams({
            'page': page.toString(),
            'per_page': perPage.toString()
        }).toString();
    
        const authorizationHeader = this.base.generateOAuthHeaderPublic(oauthToken, oauthTokenSecret);
    
        const options = {
            method: 'GET',
            headers: {
                'Authorization': authorizationHeader,
                'User-Agent': this.base.getUserAgent()
            }
        };
    
        const url = `users/${username}/collection/folders/${folderId}/releases?${queryParams}`;
        return this.base.requestPublic<CollectionResponse>(url, options);
    }
}
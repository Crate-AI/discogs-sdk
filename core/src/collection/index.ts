import { Base, Config } from "../base";
import { StorageService } from "../utils";
import type { CollectionResponse, CollectionParams } from "./types";
import type { UserIdentityResponse } from "../auth/types";


/**
 * Fetches collection items for a specific user from Discogs.
 * @param {string} username - The Discogs username.
 * @param {number} folderId - The specific folder ID in the collection; '0' for all items.
 * @param {number} page - Pagination page.
 * @param {number} perPage - Number of items per page.
 * @returns {Promise<any>} - The user's collection data.
 */

export class Collection extends Base {

    constructor(config: Config) {
        super(config);
    }

    async getCollection(params: CollectionParams): Promise<CollectionResponse> {
        const oauthToken:string = StorageService.getItem('oauthAccessToken');
        const oauthTokenSecret:string = StorageService.getItem('oauthAccessTokenSecret');
        const userIdentity: UserIdentityResponse = StorageService.getItem('userIdentity');

        const {
            folderId = 0, // Default to 0 if folderId is undefined
            page = 1, // Default to 1 if page is undefined
            perPage = 50, // Default to 50 if perPage is undefined
            username = userIdentity.username // Default to the username if username is undefined
        } = params;

        if(!userIdentity || !userIdentity.username) {
            throw new Error("User identity is not available. Make sure the user is authenticated.");
        }
        const effectiveUsername = username ?? userIdentity.username;

        const queryParams = new URLSearchParams({
            'page': page.toString(),
            'per_page': perPage.toString()
        }).toString();
    
        const authorizationHeader = this.generateOAuthHeader(oauthToken, oauthTokenSecret);
    
        const options = {
            method: 'GET',
            headers: {
                'Authorization': authorizationHeader,
                'User-Agent': this.userAgentGetter
            }
        };

        const url = `users/${effectiveUsername}/collection/folders/${folderId}/releases?${queryParams}`;
        
        return this.request<CollectionResponse>(url, options);
    }
}
    
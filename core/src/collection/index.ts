import { Base } from "../base";
import { StorageService } from "../utils";
import type { CollectionResponse } from "./types";

/**
 * Fetches collection items for a specific user from Discogs.
 * @param {string} username - The Discogs username.
 * @param {number} folderId - The specific folder ID in the collection; '0' for all items.
 * @param {number} page - Pagination page.
 * @param {number} perPage - Number of items per page.
 * @returns {Promise<any>} - The user's collection data.
 */

export class Collection extends Base {
    /**
     * Method to generate a timestamp for OAuth1.
     * @returns {string} - The generated timestamp.
     */
    private generateTimestamp2(): string {
        return `${Date.now()}`;
    }

    async getCollection(username: string, folderId: number = 0, page: number = 1, perPage: number = 50): Promise<CollectionResponse> {
        const oauthToken = StorageService.getItem('oauthAccessToken');
        const oauthTokenSecret = StorageService.getItem('oauthAccessTokenSecret');

        const endpoint = `users/${username}/collection/folders/${folderId}/releases`;
        const queryParams = new URLSearchParams({
            'page': page.toString(),
            'per_page': perPage.toString()
        }).toString();

        const headers = {
            'Authorization': `OAuth oauth_consumer_key="${this.consumerKey}",` +
                             `oauth_token="${oauthToken}",` +
                             `oauth_signature_method="PLAINTEXT",` +
                             `oauth_timestamp="${this.generateTimestamp2()}",` +
                             `oauth_nonce="${this.nonceGetter}",` +
                             `oauth_signature="${this.consumerSecret}&${oauthTokenSecret}"`,
            'User-Agent': this.userAgentGetter
        };

        const options = {
            method: 'GET',
            headers: headers
        };

        return this.request<any>(`${endpoint}?${queryParams}`, options);
    }
}
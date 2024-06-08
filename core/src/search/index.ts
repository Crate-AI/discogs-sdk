import { Base, Config } from "../base";
import { StorageService } from "../utils";
import type { SearchParams, SearchResult } from "./types";
import type { UserIdentityResponse } from "../auth/types";


/**
 * Fetches collection items for a specific user from Discogs.
 * @param {string} username - The Discogs username.
 * @param {number} folderId - The specific folder ID in the collection; '0' for all items.
 * @param {number} page - Pagination page.
 * @param {number} perPage - Number of items per page.
 * @returns {Promise<any>} - The user's collection data.
 */

export class Search extends Base {

  constructor(config: Config) {
    super(config);
  }

  async getSearchResults(params: SearchParams): Promise<SearchResult[]> {
    const oauthToken: string = StorageService.getItem('oauthAccessToken');
    const oauthTokenSecret: string = StorageService.getItem('oauthAccessTokenSecret');
    const userIdentity: UserIdentityResponse = StorageService.getItem('userIdentity');

    const { query, ...otherParams } = params

    const queryParams = new URLSearchParams(otherParams).toString();

    const authorizationHeader = this.generateOAuthHeader(oauthToken, oauthTokenSecret);

    const options = {
      method: 'GET',
      headers: {
        'Authorization': authorizationHeader,
        'User-Agent': this.userAgentGetter
      }
    };

    const url = `/database/search?q=${params.query}&${queryParams}`;


    return this.request<SearchResult[]>(url, options);
  }
}

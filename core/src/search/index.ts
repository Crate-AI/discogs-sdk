import { BaseImplementation } from "../base";
import type { SearchParams, SearchResult } from "./types";

export class Search {
    constructor(public readonly base: BaseImplementation) {}

    /**
     * Searches the Discogs database with the provided parameters
     * @param {SearchParams} params - Search parameters
     * @returns {Promise<SearchResult[]>} Array of search results
     */
    async getSearchResults(params: SearchParams): Promise<SearchResult[]> {
        const tokenManager = this.base.getTokenManager();
        let headers: Record<string, string> = {
            "User-Agent": this.base.getUserAgent(),
        };

        const accessToken = await tokenManager.getAccessToken();
        const tokenSecret = await tokenManager.getRequestTokenSecret();

        if (accessToken && tokenSecret) {
            const authorizationHeader = this.base.generateOAuthHeaderPublic(
                accessToken,
                tokenSecret
            );
            headers.Authorization = authorizationHeader;
        } else {
            console.warn('No authentication provided. Rate limits will be restricted to 25 requests/minute.');
        }

        const { query, ...otherParams } = params;
        const queryParams = new URLSearchParams(
            otherParams as Record<string, string>
        ).toString();

        const url = `/database/search?q=${encodeURIComponent(query)}&${queryParams}`;

        return this.base.requestPublic<SearchResult[]>(url, {
            method: "GET",
            headers,
        });
    }
}
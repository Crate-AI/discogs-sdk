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
        const accessToken = await tokenManager.getAccessToken();
        const tokenSecret = await tokenManager.getRequestTokenSecret();

        if (!accessToken || !tokenSecret) {
            throw new Error("Authentication required. Please authenticate first.");
        }

        const { query, ...otherParams } = params;
        const queryParams = new URLSearchParams(
            otherParams as Record<string, string>
        ).toString();

        const authorizationHeader = this.base.generateOAuthHeaderPublic(
            accessToken,
            tokenSecret
        );

        const headers = {
            Authorization: authorizationHeader,
            "User-Agent": this.base.getUserAgent(),
        };

        const url = `/database/search?q=${encodeURIComponent(query)}&${queryParams}`;

        return this.base.requestPublic<SearchResult[]>(url, {
            method: "GET",
            headers,
        });
    }
}
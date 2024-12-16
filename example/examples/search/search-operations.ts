import { DiscogsSDK } from '@crate.ai/discogs-sdk';

export async function searchExample(sdk: DiscogsSDK) {
    try {
        const basicResults = await sdk.search.getSearchResults({
            query: 'Dark Side of the Moon',
            type: 'release'
        });
        console.log('Basic search results:', basicResults);

        const advancedResults = await sdk.search.getSearchResults({
            query: 'Miles Davis',
            type: 'release',
            year: '1959',
            format: 'album'
        });
        console.log('Advanced search results:', advancedResults);

    } catch (error) {
        console.error('Search operations failed:', error);
        throw error;
    }
} 
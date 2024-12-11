import { DiscogsSDK } from '@crate.ai/discogs-sdk';
import path from 'path';
import 'dotenv/config';
import {
  intro,
  outro,
  note,
  confirm,
  isCancel,
  cancel,
  spinner
} from '@clack/prompts';
import colors from 'picocolors';

// Configure storage with FileSystemStorageAdapter

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: process.env.CONSUMER_KEY || "",
  DiscogsConsumerSecret: process.env.CONSUMER_SECRET || "",
  callbackUrl: 'http://localhost:4567/callback',
  userAgent: 'MyDiscogsApp/1.0 +http://your-app-url.com'
});

(async () => {
  try {
    intro(colors.bgBlue('Discogs SDK Test'));

    // Test 1: Authentication
    const authSpinner = spinner();
    authSpinner.start('Starting authentication...');
    
    try {
      await discogs.auth.authenticate();
      authSpinner.stop('Authentication successful');
    } catch (error: any) {
      authSpinner.stop('Authentication failed');
      throw error;
    }

    // Test 2: Get User Identity
    const identitySpinner = spinner();
    identitySpinner.start('Fetching user identity...');
    
    try {
      const identity = await discogs.auth.getUserIdentity({
      });
      console.log('User Identity:', identity);
      identitySpinner.stop('Identity fetched successfully');
    } catch (error: any) {
      identitySpinner.stop('Failed to fetch identity');
      throw error;
    }

    // Test 3: Get User Collection
    const collectionSpinner = spinner();
    collectionSpinner.start('Fetching collection...');
    
    try {
      const collection = await discogs.collection.getCollection({
        username: 'your_username',  // You might want to use the identity.username from above
        page: 1,
        perPage: 5
      });
      console.log('Collection (First 5 items):', collection);
      collectionSpinner.stop('Collection fetched successfully');
    } catch (error: any) {
      collectionSpinner.stop('Failed to fetch collection');
      throw error;
    }

    // Test 4: Search
    const searchSpinner = spinner();
    searchSpinner.start('Performing search...');
    
    try {
      const searchResults = await discogs.search.getSearchResults({
        query: "Rush",
        type: "release",
        year: "1981"
      });
      console.log('Search Results:', searchResults);
      searchSpinner.stop('Search completed successfully');
    } catch (error: any) {
      searchSpinner.stop('Search failed');
      throw error;
    }

    outro('All tests completed successfully!');
  } catch (error: any) {
    note(`Error: ${error.message || error}`, 'Error');
    cancel('Tests failed due to error.');
    process.exit(1);
  }
})();
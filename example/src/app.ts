import { DiscogsSDK, StorageService } from '@crate.ai/discogs-sdk';
import path from 'path';

// Configure storage path to a directory where you have write permissions
StorageService.storagePath = path.join(process.cwd(), 'storage.json');

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: "YOUR_CONSUMER_KEY",
  DiscogsConsumerSecret: "YOUR_CONSUMER_SECRET",
});

(async () => {
  try {
    const res = await discogs.auth.authenticate();
    console.log("Authenticated");

    const identity = await discogs.auth.getUserIdentity({});
    console.log(identity);

    const results = await discogs.search.getSearchResults({
      query: "rush",
      country: "canada",
    });
    console.log(results);
  } catch (error) {
    console.error("Error:", error);
  }
})();

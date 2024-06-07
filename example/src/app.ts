import { DiscogsSDK, StorageService } from '@crate.ai/discogs-sdk';
import path from 'path';

// Configure storage path to a directory where you have write permissions
StorageService.storagePath = path.join(process.cwd(), 'storage.json');
console.log('storagePath', StorageService.storagePath);

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: "your_consumer_key",
  DiscogsConsumerSecret: "your_consumer_secret",
});

(async () => {
  try {
    const res = await discogs.auth.authenticate();
    console.log("Authenticated");

    const identity = await discogs.auth.getUserIdentity({});
    console.log(identity);
  } catch (error) {
    console.error("Error:", error);
  }
})();

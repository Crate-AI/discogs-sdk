# Discogs SDK

The Discogs SDK is a library that uses the Discogs API to authenticate and access their data. Currently, the library supports the authentication flow, collection, search and retrieving the user's identity.

# Getting Started
1. sign in to discogs and go to [developer settings](https://www.discogs.com/settings/developers)
2. click on "New App"
3. fill out the form and click "Create App"
4. Obtain your consumer key and secret from Discogs [here](https://www.discogs.com/settings/developers).
5. Install the library using npm: `npm install @crate.ai/discogs-sdk`.

# Usage
1. Import the library into your project.
2. Create a new instance of the library with your Discogs consumer key and secret.
3. Call the `authenticate` method on the instance.
4. The method will return a promise that resolves with the user's identity.

Here's an example of how to use the library:

```javascript
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

```

That's it! You're now ready to use the library in your project.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./core/CONTRIBUTING.md) for details on how to contribute.

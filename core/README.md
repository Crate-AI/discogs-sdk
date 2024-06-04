# Discogs SDK

The Discogs SDK is a library that uses the Discogs API to authenticate and access their data. Currently, the library only supports the authentication flow and retrieving the user's identity.

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


// Configure storage path to a directory where you have write permissions
StorageService.storagePath = path.join(process.cwd(), 'storage.json');

const discogs = new DiscogsSDK({
 DiscogsConsumerKey: "yourConsumerKey",
 DiscogsConsumerSecret: "yourConsumerSecret"
});

discogs.auth.authenticate().then(() => {
  console.log('Authenticated');
  discogs.auth.getUserIdentity({}).then((identity) => {
    console.log(identity);
    discogs.collection.getCollection({}).then((collection) => {
      console.log(collection.pagination.items);
    });
}).catch(error => console.error('Error in fetching user identity:', error));
}).catch(error => console.error('Error in authentication:', error));
```

That's it! You're now ready to use the library in your project.


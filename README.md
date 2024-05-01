# Discogs SDK

is a library that uses the Discogs API to authenticate and uses their API to get data.
As of now, the library is only supporting the auth flow and to get the identity of the user.

# how to get started with the library
get your consumer key and secret from discogs [here](https://www.discogs.com/settings/developers)
npm install @crate.ai/discogs-sdk

# How to use the library

1. Import the library in your project
2. Create a new instance of the library with your Discogs consumer key and secret
3. Call the `authenticateAndGetIdentity` method on the instance
4. The method will return a promise that resolves with the user's identity

Here's an example of how to use the library:

```javascript
import discogsSDK from "@crate.ai/discogs-sdk";

const auth = new discogsSDK({
 DiscogsConsumerKey: "yourConsumerKey",
 DiscogsConsumerSecret: "yourConsumerSecret"
});

auth.authenticateAndGetIdentity().then((res) => {
    console.log('User identity:', res);
});
```

That's it! You're now ready to use the library in your project.


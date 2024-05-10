import discogsSDK from '@crate.ai/discogs-sdk';
const discogs = new discogsSDK({
    DiscogsConsumerKey: "VzgMPIFOlJDZhpWoZMUX",
    DiscogsConsumerSecret: "kEPnGjnAGawTRqgnTLMkdCujUIlAHNFm",
});
discogs.authenticateAndGetIdentity().then((identity) => {
    console.log(identity);
});
discogs.getCollection('baston2rue').then((collection) => {
    console.log(collection);
});

import  DiscogsSDK  from "@crate.ai/discogs-sdk";

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: "consumerKey",
  DiscogsConsumerSecret: "consumerSecret",
});

discogs.authenticateAndGetIdentity().then((identity) => {
  console.log(identity);
});


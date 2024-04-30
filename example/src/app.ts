import discogsSDK from "@crate.ai/discogs-sdk";



const auth = new discogsSDK({
 DiscogsConsumerKey: "consumerKey",
 DiscogsConsumerSecret: "consumerSecret"
});


auth.authenticateAndGetIdentity().then((res) => {
    console.log('User identity:', res);
});
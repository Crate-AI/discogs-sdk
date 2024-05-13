import DiscogsSDK from '@crate.ai/discogs-sdk';

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: "Your Consumer Key",
  DiscogsConsumerSecret: "Your Consumer Secret",
});

discogs.authenticate().then(() => {
  console.log('Authenticated');
  discogs.getUserIdentity({}).then((identity) => {
    console.log(identity);
    discogs.getCollection({}).then((collection) => {
      console.log(collection.pagination.items);
    });
}).catch(error => console.error('Error in fetching user identity:', error));
}).catch(error => console.error('Error in authentication:', error));

// discogs.authenticateAndGetIdentity().then((identity) => {
//   console.log(identity);
//   // Ensure collection is fetched after authentication is successful
//   discogs.getCollection({}).then((collection) => {
//     console.log(collection.pagination.items);
//   });
// }).catch(error => console.error('Error in authentication:', error));



// discogs.getUserIdentity({}).then((identity) => {
//     console.log(identity);
// });
// discogs.getUserIdentity({}).then((identity) => {
//     console.log(identity);
// }).catch(error => console.error('Error in fetching user identity:', error));


// discogs.getCollection({username:'Baston2rue'}).then((collection) => {
//     console.log(collection.pagination.items);
// }).catch(error => console.error('Error in fetching collection:', error));


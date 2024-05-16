import { DiscogsSDK, StorageService } from '@crate.ai/discogs-sdk';
import path from 'path';

// Configure storage path to a directory where you have write permissions
StorageService.storagePath = path.join(process.cwd(), 'storage.json');
console.log('storagePath', StorageService.storagePath);

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: "your_consumer_key",
  DiscogsConsumerSecret: "your_consumer_secret",
});

// console.log('discogs', discogs);

// discogs.auth.authenticate().then((res) => {
//     console.log('Authenticated');
//     console.log('response', res);
// });


// discogs.auth.authenticate().then(() => {
//   console.log('Authenticated');
//   discogs.auth.getUserIdentity({}).then((identity) => {
//     console.log(identity);
//     discogs.collection.getCollection({}).then((collection) => {
//       console.log(collection.pagination.items);
//     });
// }).catch(error => console.error('Error in fetching user identity:', error));
// }).catch(error => console.error('Error in authentication:', error));

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


// discogs.collection.getCollection({folderId: 1}).then((collection) => {
//     console.log(collection.pagination.items);
// }).catch(error => console.error('Error in fetching collection:', error));


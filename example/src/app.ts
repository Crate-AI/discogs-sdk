import { DiscogsSDK, StorageService } from '@crate.ai/discogs-sdk';
import path from 'path';
import 'dotenv/config';
import {
  intro,
  outro,
  note,
  confirm,
  isCancel,
  cancel,
  spinner
} from '@clack/prompts';
import colors from 'picocolors';

// Configure storage path to a directory where you have write permissions
StorageService.storagePath = path.join(process.cwd(), 'storage.json');

const discogs = new DiscogsSDK({
  DiscogsConsumerKey: process.env.CONSUMER_KEY || "",
  DiscogsConsumerSecret: process.env.CONSUMER_SECRET || "",
});

(async () => {
  try {
    intro(colors.bgBlue('Discogs Authenticationzzz'));

    const openBrowser = await confirm({
      message: 'Would you like to open the authorization URL in your browser automatically?',
    });

    if (isCancel(openBrowser)) {
      cancel('Operation cancelled');
      return;
    }

    const authSpinner = spinner();
    authSpinner.start('Waiting for authorization...');

    await discogs.auth.authenticate();

    authSpinner.stop('Authorization completed.');

    const identity = await discogs.auth.getUserIdentity({});
    console.log(identity);

    const results = await discogs.search.getSearchResults({
      query: "rush",
      country: "canada",
    });
    console.log(results);

    outro('Authentication successful!');
  } catch (error : any) {
    note(`Error: ${error.message || error}`, 'Error');
    cancel('Operation cancelled due to error.');
  }
})();

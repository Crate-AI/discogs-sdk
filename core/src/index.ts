import { Base , Config } from "./base";
import { Auth } from "./auth";
import { Collection } from "./collection";
import { Search } from "./search";
export * from './auth';
export * from './base';
export * from './collection';
export * from './search';
export * from './utils';


class DiscogsSDK extends Base {
    auth: Auth;
    collection: Collection;
    search: Search;

    constructor(config: Config) {
        super(config);
        this.auth = new Auth(config);
        this.collection = new Collection(config);
        this.search = new Search(config);
    }
}
export { DiscogsSDK };


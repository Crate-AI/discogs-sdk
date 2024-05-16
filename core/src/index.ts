import { Base , Config } from "./base";
import { Auth } from "./auth";
import { Collection } from "./collection";
export * from './auth';
export * from './base';
export * from './collection';
export * from './utils';  // Add this line


class DiscogsSDK extends Base {
    auth: Auth;
    collection: Collection;

    constructor(config: Config) {
        super(config);
        this.auth = new Auth(config);
        this.collection = new Collection(config);
    }
}
export { DiscogsSDK };
// export default DiscogsSDK;


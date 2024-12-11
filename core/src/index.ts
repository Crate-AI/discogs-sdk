import { Auth } from './auth';
import { Base, BaseImplementation, Config } from './base';
import { Collection } from './collection';
import { Search } from './search';

// Export interfaces
export * from './interfaces/http';
export * from './interfaces/oauth';
export * from './interfaces/storage';
export * from './interfaces/token';

// Export implementations
export * from './implementations/DefaultHttpClient';
export * from './implementations/DefaultTokenManger';
export * from './implementations/DefaultOAuthHandler';

// Export adapters
export * from './adapters/fileSystemStorage';
export * from './adapters/memoryStorage';

// Export core modules and types
export { Auth } from './auth';
export { Base, BaseImplementation, Config } from './base';
export { Collection } from './collection';
export { Search } from './search';

class DiscogsSDK {
    private base: BaseImplementation;
    public auth: Auth;
    public collection: Collection;
    public search: Search;

    constructor(config: Config) {
        this.base = new BaseImplementation(config);
        this.auth = new Auth(this.base);
        this.collection = new Collection(this.base);
        this.search = new Search(this.base);
    }
}

export { DiscogsSDK };
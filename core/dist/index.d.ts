import { Base } from "./base";
import { Auth } from "./auth";
import { Collection } from "./collection";
declare class discogsSDK extends Base {
}
interface discogsSDK extends Auth, Collection {
}
export default discogsSDK;

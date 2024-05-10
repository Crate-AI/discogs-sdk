import { Base } from "./base";
import { Auth } from "./auth";
import { Collection } from "./collection";
import { applyMixins } from "./utils";

class discogsSDK extends Base {}
interface discogsSDK extends Auth, Collection {}

applyMixins(discogsSDK, [Auth, Collection]);

export default discogsSDK;
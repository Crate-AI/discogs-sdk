import { Base } from "./base";
import { Auth } from "./auth";
import { applyMixins } from "./utils";

class discogsSDK extends Base {}
interface discogsSDK extends Auth {}

applyMixins(discogsSDK, [Auth]);

export default discogsSDK;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discogs_sdk_1 = __importDefault(require("@crate.ai/discogs-sdk"));
const auth = new discogs_sdk_1.default({
    DiscogsConsumerKey: "VzgMPIFOlJDZhpWoZMUX",
    DiscogsConsumerSecret: "kEPnGjnAGawTRqgnTLMkdCujUIlAHNFm"
});
auth.authenticateAndGetIdentity().then((res) => {
    console.log('User identity:', res);
});

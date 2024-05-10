import { Base } from "../base";
import type { CollectionResponse } from "./types";
export declare class Collection extends Base {
    private generateTimestamp2;
    getCollection(username: string, folderId?: number, page?: number, perPage?: number): Promise<CollectionResponse>;
}

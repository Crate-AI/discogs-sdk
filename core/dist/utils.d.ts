export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export declare class StorageService {
    private static storage;
    static setItem(key: string, value: any): void;
    static getItem(key: string): any;
}

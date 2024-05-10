export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
        );
      });
    });
  }

export class StorageService {
  private static storage: any = {};

  static setItem(key: string, value: any) {
      StorageService.storage[key] = value;
  }

  static getItem(key: string) {
      return StorageService.storage[key];
  }
}

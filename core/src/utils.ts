import path from 'path';
import fs from 'fs';

class StorageService {
  // static storagePath = path.join(process.cwd(), 'storage.json');
  static storagePath: string;

  static setItem(key: string, value: any) {
      let storage = this.loadStorage();
      storage[key] = value;
      fs.writeFileSync(this.storagePath, JSON.stringify(storage, null, 2), 'utf8');
  }

  static getItem(key: string) {
      let storage = this.loadStorage();
      return storage[key];
  }

  private static loadStorage() {
      if (fs.existsSync(this.storagePath)) {
          return JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      }
      return {};
  }
}
  
  export { StorageService };

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


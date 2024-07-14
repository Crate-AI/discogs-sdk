import path from 'path';
import fs from 'fs';
class StorageService {
  static storagePath: string;

  static setItem(key: string, value: any) {
      const storage = this.loadStorage();
      storage[key] = value;
      fs.writeFileSync(this.storagePath, JSON.stringify(storage, null, 2), 'utf8');
  }

  static getItem(key: string) {
      const storage = this.loadStorage();
      return storage[key];
  }

  private static loadStorage() {
      if (!fs.existsSync(this.storagePath)) {
          fs.writeFileSync(this.storagePath, JSON.stringify({}), 'utf8');
          return {};
      }

      const fileContent = fs.readFileSync(this.storagePath, 'utf8');
      if (!fileContent) {
          return {};
      }

      try {
          return JSON.parse(fileContent);
      } catch (error) {
          console.error('Error parsing JSON file:', error);
          return {};
      }
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


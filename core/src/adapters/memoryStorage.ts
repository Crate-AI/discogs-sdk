// src/adapters/memoryStorage.ts
import { StorageAdapter } from '../interfaces/storage';

export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Record<string, any> = {};

  getItem(key: string): any {
    return this.storage[key];
  }

  setItem(key: string, value: any): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }
}
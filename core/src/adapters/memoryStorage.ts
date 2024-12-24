import { StorageAdapter } from '../interfaces/storage';

export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Record<string, any> = {};

  getItem(key: string): any {
    return this.storage[key];
  }

  setItem(key: string, value: any): Promise<void> {
    this.storage[key] = value;
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    delete this.storage[key];
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.storage = {};
    return Promise.resolve();
  }
}

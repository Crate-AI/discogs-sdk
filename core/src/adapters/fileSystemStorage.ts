import fs from 'fs';
import { StorageAdapter } from '../interfaces/storage';

export class FileSystemStorageAdapter implements StorageAdapter {
  private storagePath: string;
  private storage: Record<string, any> = {};

  constructor(storagePath: string) {
    this.storagePath = storagePath;
    this.loadStorage();
  }

  private loadStorage(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        this.storage = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading storage:', error);
      this.storage = {};
    }
  }

  private saveStorage(): void {
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(this.storage, null, 2));
    } catch (error) {
      console.error('Error saving storage:', error);
    }
  }

  getItem(key: string): any {
    return this.storage[key];
  }

  setItem(key: string, value: any): void {
    this.storage[key] = value;
    this.saveStorage();
  }

  removeItem(key: string): void {
    delete this.storage[key];
    this.saveStorage();
  }
}
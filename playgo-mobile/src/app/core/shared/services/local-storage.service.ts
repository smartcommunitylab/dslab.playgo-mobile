import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storageInstancePromise: Promise<Storage>;
  constructor(private storageFactory: Storage) {
    this.storageInstancePromise = this.getStorageImplementation();
    // TODO:clear local storage automatically, after new app version (or code push version)
    // for consistency.
  }

  private async getStorageImplementation() {
    await this.storageFactory.defineDriver(CordovaSQLiteDriver);
    const storageInstance = await this.storageFactory.create();
    return storageInstance;
  }

  public getStorageOf<T = never>(localStorageKey: string) {
    return new LocalStorage<T>(localStorageKey, this.storageInstancePromise);
  }
  public async clearAll(): Promise<void> {
    const storage = await this.storageInstancePromise;
    storage.clear();
  }
}
class LocalStorage<T> {
  private storageKey: string;
  private storageMetaKey: string;
  constructor(
    storageKey: string,
    private storageInstancePromise: Promise<Storage>
  ) {
    this.storageKey = 'playgo-storage-' + storageKey;
    this.storageMetaKey = 'playgo-storage-meta-' + storageKey;
  }
  public async set(data: T | null): Promise<void> {
    // hmm we could maybe use some sort of compression here
    // https://pieroxy.net/blog/pages/lz-string/index.html
    const storage = await this.storageInstancePromise;
    await storage.set(this.storageKey, JSON.stringify(data || null));
    const metaInformation: Meta = {
      lastUpdated: new Date().getTime(),
    };
    await storage.set(this.storageMetaKey, JSON.stringify(metaInformation));
  }

  public async get(): Promise<T | null> {
    return await this.getFromStorage(this.storageKey);
  }

  public async getMeta(): Promise<Meta> {
    const meta: Meta = await this.getFromStorage(this.storageMetaKey);
    const defaultMeta: Meta = {
      lastUpdated: 0,
    };
    return meta ?? defaultMeta;
  }

  private async getFromStorage(key: string): Promise<any> {
    const storage = await this.storageInstancePromise;
    const stringVal = await storage.get(key);
    return JSON.parse(stringVal);
  }

  public async clear(): Promise<void> {
    const storage = await this.storageInstancePromise;
    await storage.remove(this.storageKey);
    await storage.remove(this.storageMetaKey);
  }
}

export type LocalStorageType<T> = LocalStorage<T>;

export type Meta = {
  lastUpdated: number;
};

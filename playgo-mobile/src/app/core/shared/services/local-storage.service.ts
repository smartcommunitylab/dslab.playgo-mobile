import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storageInstancePromise: Promise<Storage>;
  constructor(private storageFactory: Storage) {
    this.storageInstancePromise = this.storageFactory.create();
    // clear local storage automatically, after new app version (or code push version)
    // for consistency.
  }

  public getStorageOf<T = never>(localStorageKey: string) {
    return new LocalStorage<T>(
      'playgo-storage-' + localStorageKey,
      this.storageInstancePromise
    );
  }
  public async clearAll(): Promise<void> {
    const storage = await this.storageInstancePromise;
    storage.clear();
  }
}
class LocalStorage<T> {
  constructor(
    private storageKey: string,
    private storageInstancePromise: Promise<Storage>
  ) {}
  public async set(data: T | null): Promise<void> {
    // hmm we could maybe use some sort of compression here
    // https://pieroxy.net/blog/pages/lz-string/index.html
    const storage = await this.storageInstancePromise;
    await storage.set(this.storageKey, JSON.stringify(data || null));
  }
  public async get(): Promise<T | null> {
    const storage = await this.storageInstancePromise;
    const stringVal = await storage.get(this.storageKey);
    return JSON.parse(stringVal);
  }
  public async clear(): Promise<void> {
    const storage = await this.storageInstancePromise;
    await storage.remove(this.storageKey);
  }
}

export type LocalStorageType<T> = LocalStorage<T>;

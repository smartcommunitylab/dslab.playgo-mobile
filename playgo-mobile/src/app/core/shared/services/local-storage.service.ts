import { Injectable } from '@angular/core';
import { LocalStorageRefService } from './local-storage-ref.service';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storage: Storage;
  constructor(private localStorageRefService: LocalStorageRefService) {
    this.storage = this.localStorageRefService.getStorageImplementation();
    // TODO:
    // clear local storage automatically, after new app version (or code push version)
    // for consistency.
  }

  public getStorageOf<T = never>(localStorageKey: string) {
    return new LocalStorage<T>(
      'playgo-storage-' + localStorageKey,
      this.storage
    );
  }
  public clearAll() {
    this.storage.clear();
  }
}
class LocalStorage<T> {
  constructor(private storageKey: string, private storage: Storage) {}
  set(data: T | null) {
    // hmm we could maybe use some sort of compression here
    // https://pieroxy.net/blog/pages/lz-string/index.html
    this.storage.setItem(this.storageKey, JSON.stringify(data || null));
  }
  get(): T | null {
    const stringVal = this.storage.getItem(this.storageKey);
    return JSON.parse(stringVal);
  }
  clear() {
    this.storage.removeItem(this.storageKey);
  }
}

export type LocalStorageType<T> = LocalStorage<T>;

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {
    // TODO:
    // clear local storage automatically, after new app version (or code push version)
    // for consistency.
  }

  public getStorageOf<T = never>(localStorageKey: string) {
    return new LocalStorage<T>('playgo-storage' + localStorageKey);
  }
}
class LocalStorage<T> {
  constructor(private storageKey: string) {}
  set(data: T | null) {
    // hmm we could maybe use some sort of compression here
    // https://pieroxy.net/blog/pages/lz-string/index.html
    localStorage.setItem(this.storageKey, JSON.stringify(data || null));
  }
  get(): T | null {
    const stringVal = localStorage.getItem(this.storageKey);
    return JSON.parse(stringVal);
  }
}

export type LocalStorageType<T> = LocalStorage<T>;
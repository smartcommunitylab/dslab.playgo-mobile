import { Injectable } from '@angular/core';

function getLocalStorage(): Storage {
  return localStorage;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageRefService {
  getStorageImplementation(): Storage {
    return getLocalStorage();
  }
}

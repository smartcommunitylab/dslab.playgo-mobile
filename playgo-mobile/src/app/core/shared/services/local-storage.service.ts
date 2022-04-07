import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser } from '../model/user.model';
import { LocalStorageRefService } from './local-storage-ref.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private localStorage: Storage;

  private userSubject = new BehaviorSubject<IUser>(null);
  user$ = this.userSubject.asObservable();

  constructor(private localStorageRefService: LocalStorageRefService) {
    this.localStorage = localStorageRefService.localStorage;
  }

  setUser(user: IUser): void {
    const jsonData = JSON.stringify(user);
    this.localStorage.setItem('user', jsonData);
    this.userSubject.next(user);
  }

  loadUser(): Promise<IUser> {
    const data = JSON.parse(this.localStorage.getItem('user'));
    this.userSubject.next(data);
    return Promise.resolve(data);
  }

  clearUser() {
    this.localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  clearAllLocalStorage(): void {
    this.localStorage.clear();
    this.userSubject.next(null);
  }
}

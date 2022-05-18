import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { IUser } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  private storage = this.localStorageService.getStorageOf<IUser>('user');

  private userSubject = new BehaviorSubject<IUser>(null);
  user$ = this.userSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {}

  setUser(user: IUser): void {
    this.storage.set(user);
    this.userSubject.next(user);
  }

  loadUser(): Promise<IUser> {
    const user = this.storage.get();
    this.userSubject.next(user);
    return Promise.resolve(user);
  }

  clearUser() {
    this.storage.clear();
    this.userSubject.next(null);
  }
}

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../auth/auth-http.service';
import { IUser } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userProfileSubject = new ReplaySubject<IUser>();
  private userProfile: IUser = null;
  public userProfile$: Observable<IUser> =
    this.userProfileSubject.asObservable();

  constructor(
    private authHttpService: AuthHttpService,
    public translateService: TranslateService
  ) {
    this.startService();
  }
  async startService() {
    //check if locally present and I'm logged (store in the memory)
    if (!this.userProfile) {
      try {
        const user = await this.getProfile();
        if (user) {
          this.userProfile = user;
          this.userProfileSubject.next(this.userProfile);
          this.processUser(user);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  processUser(user: IUser) {
    this.translateService.use(user.language);
  }

  registerPlayer(user: IUser): Promise<IUser> {
    //TODO update local profile
    return this.authHttpService.request<IUser>(
      'POST',
      environment.serverUrl.register,
      user
    );
  }
  async isUserRegistered(): Promise<boolean> {
    try {
      const user = await this.authHttpService.request<IUser>(
        'GET',
        environment.serverUrl.profile
      );
      if (user) {
        //user registered
        return true;
      } else {
        //user not registered
        return false;
      }
    } catch (e) {
      {
        return false;
      }
    }
  }
  getProfile(): Promise<IUser> {
    return this.authHttpService.request<IUser>(
      'GET',
      environment.serverUrl.profile
    );
  }
  // getPlayer(): Promise<IUser> {
  //     return this.authHttpService.request<IUser>('GET', environment.serverUrl.player);
  // }
  async updatePlayer(user: IUser): Promise<IUser> {
    //TODO update local profile
    const player = await this.authHttpService.request<IUser>(
      'PUT',
      environment.serverUrl.profile,
      user
    );
    this.processUser(user);
    return player;
  }
}

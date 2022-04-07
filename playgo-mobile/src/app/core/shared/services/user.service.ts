import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../../auth/auth-http.service';
import { IUser } from '../model/user.model';
import localeItalian from '@angular/common/locales/it';
import localeEnglish from '@angular/common/locales/en';
import { TransportType } from '../tracking/trip.model';
import { LocalStorageService } from './local-storage.service';
import { TerritoryService } from './territory.service';
@Injectable({ providedIn: 'root' })
export class UserService {
  private userProfileSubject = new ReplaySubject<IUser>();
  private userProfileMeansSubject = new ReplaySubject<TransportType[]>();
  private userLocale: string;
  private userProfile: IUser = null;
  public userProfileMeans$: Observable<TransportType[]> =
    this.userProfileMeansSubject.asObservable();
  public userProfile$: Observable<IUser> =
    this.userProfileSubject.asObservable();

  constructor(
    private authHttpService: AuthHttpService,
    private translateService: TranslateService,
    private territoryService: TerritoryService,
    private localStorageService: LocalStorageService
  ) {
    this.startService();
  }
  set locale(value: string) {
    this.userLocale = value;
  }
  get locale(): string {
    return this.userLocale || 'en-US';
  }

  registerLocale(locale: string) {
    if (!locale) {
      return;
    }
    this.translateService.use(locale);
    switch (locale) {
      case 'it': {
        this.userLocale = 'it-IT';
        registerLocaleData(localeItalian);
        break;
      }
      case 'en': {
        this.userLocale = 'en-US';
        registerLocaleData(localeItalian);
        break;
      }
    }
  }
  async startService() {
    //check if locally present and I'm logged (store in the memory)
    if (!this.userProfile) {
      try {
        const user = await this.getProfile();
        if (user) {
          this.userProfile = user;
          this.processUser(user);
          this.userProfileSubject.next(this.userProfile);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  processUser(user: IUser) {
    this.setUserProfileMeans(user.territoryId);
    this.registerLocale(user.language);
  }
  async setUserProfileMeans(territoryId: string) {
    //get territories means and set available means userProfileMeans$
    const userTerritory = await this.territoryService
      .getTerritory(territoryId)
      .toPromise();
    this.userProfileMeansSubject.next(userTerritory.territoryData.means);
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
    return this.localStorageService.loadUser().then((user) => {
      if (user) {
        return Promise.resolve(user);
      } else {
        this.authHttpService
          .request<IUser>('GET', environment.serverUrl.profile)
          .then((newUser) => {
            this.localStorageService.setUser(newUser);
            return newUser;
          });
      }
    });
  }

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

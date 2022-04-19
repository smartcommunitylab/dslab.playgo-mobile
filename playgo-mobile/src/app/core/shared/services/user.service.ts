import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../../auth/auth-http.service';
import { IUser } from '../model/user.model';
import localeItalian from '@angular/common/locales/it';
import { TransportType } from '../tracking/trip.model';
import { LocalStorageService } from './local-storage.service';
import { TerritoryService } from './territory.service';
import { Avatar, IAvatar } from '../model/avatar.model';
import { IStatus } from '../model/status.model';
import { ReportService } from './report.service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class UserService {


  private userProfileSubject = new ReplaySubject<IUser>();
  private userProfileMeansSubject = new ReplaySubject<TransportType[]>();
  private userStatusSubject = new ReplaySubject<IStatus>();
  private userLocale: string;
  private userProfile: IUser = null;
  private userStatus: IStatus = null;
  public userProfileMeans$: Observable<TransportType[]> =
    this.userProfileMeansSubject.asObservable();
  public userProfile$: Observable<IUser> =
    this.userProfileSubject.asObservable();
  public userStatus$: Observable<IUser> =
    this.userStatusSubject.asObservable();
  constructor(
    private authHttpService: AuthHttpService,
    private translateService: TranslateService,
    private reportService: ReportService,
    private territoryService: TerritoryService,
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.startService();
  }
  set locale(value: string) {
    this.userLocale = value;
  }
  get locale(): string {
    return this.userLocale || 'en-US';
  }
  uploadAvatar(file: any): Promise<IAvatar> {
    const formData = new FormData();
    formData.append('data', file);
    return this.authHttpService.request<IAvatar>(
      'POST',
      environment.serverUrl.avatar,
      formData,
      true
    );
  }
  getAvatar(): Promise<any> {
    let localHeaders = new HttpHeaders();
    // eslint-disable-next-line max-len
    localHeaders = localHeaders.append('Authorization', 'Bearer eyJraWQiOiJyc2ExIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ1X2MyMDE2YzMwLTIwYTQtNDdiZC04YzdhLTI2Njk5NWMwZmY5ZSIsInpvbmVpbmZvIjoiR01UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9hYWMucGxhdGZvcm0uc21hcnRjb21tdW5pdHlsYWIuaXQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYXR0ZW8uY2hpbmlAZmJrLmV1IiwibG9jYWxlIjoiZW4iLCJnaXZlbl9uYW1lIjoiTWF0dGVvIiwiYXVkIjpbImFhYy5vcGVuaWQiLCJjXzU0NDU2MzRjLTk1ZDYtNGMwZS1hMWZmLTgyOWI5NTFiOTFiMyIsImFhYy5wcm9maWxlIl0sIm5iZiI6MTY1MDM4MTY0OCwiYXpwIjoiY181NDQ1NjM0Yy05NWQ2LTRjMGUtYTFmZi04MjliOTUxYjkxYjMiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIGVtYWlsIiwicmVhbG0iOiJwbGF5YW5kZ28iLCJleHAiOjE2NTAzODc2NDgsImZhbWlseV9uYW1lIjoiQ2hpbmkiLCJpYXQiOjE2NTAzODE2NDgsImVtYWlsIjoibWF0dGVvLmNoaW5pQGZiay5ldSIsImp0aSI6IjhpSGxvY1ZWMkJKZTBxVHE0dExRUzlrd3Y4YyJ9.OiJAhUgqa5sHNGjK1RJF6zmtp64az_whdhr2RVaI7xDJsk0Mgm05-_UF3ulZEWkgGxd_03AquS67pHu-BgjOThSDca5wFVGeQC5yCTRHYcyefxExxvVwsj1mhDjpoZ_lkZuF02s6bN6gJmFNXhOewL2AP6lOHBNFgv-_GO4dAzNbPgtLwHf1N99dlotG3mDnF7fWSOUn_qRNGHCaEUkLJs36iCSIiHt4K8wr21l_WV9V8OvYQAGMQ2AotnGxelZgv2F4ldSxZqTXFA89LXVkVK-f4Mh5Kqy41epJJ-SWgeJOsiLCUHX-qeL9xOaJl5gTlqISCHPLUKNbqSnkyfaQ3w');
    // eslint-disable-next-line max-len
    return this.http.get(environment.serverUrl.apiUrl + environment.serverUrl.avatar, { responseType: 'blob', headers: localHeaders }).toPromise();

    // return this.authHttpService.request<any>(
    //   'GET',
    //   environment.serverUrl.avatar,
    //   null,
    //   true,
    //   'blob');
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
    try {
      const user = await this.getProfile();
      const avatarImage = await this.getAvatar();
      // const objectURL = URL.createObjectURL(avatarImage);
      // const avatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      if (user) {
        this.userProfile = user;
        this.processUser(user, avatarImage);
        this.userProfileSubject.next(this.userProfile);
      }
      const status = await this.reportService.getStatus();
      if (status) {
        this.userStatus = status;
        this.userStatusSubject.next(this.userStatus);
      }
    } catch (e) {
      console.log(e);
    }
  }
  updateImage(avatar: IAvatar) {
    this.userProfile.avatar = avatar;
    this.userProfileSubject.next(this.userProfile);
  }
  processUser(user: IUser, avatar?: any) {
    if (avatar) {
      this.setUserAvatar(user, avatar);
    }
    this.setUserProfileMeans(user.territoryId);
    this.registerLocale(user.language);
  }
  setUserAvatar(user: IUser, avatar: Blob) {
    this.createImageFromBlob(user, avatar);
  }
  createImageFromBlob(user: IUser, userimage: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (!user.avatar) { user.avatar = new Avatar(); }
      user.avatar.avatarData = reader.result;
      user.avatar.avatarDataSmall = reader.result;
      this.userProfileSubject.next(user);
    }, false);
    if (userimage) {
      reader.readAsDataURL(userimage);
    }
  }
  async setUserProfileMeans(territoryId: string) {
    //get territories means and set available means userProfileMeans$
    const userTerritory = await this.territoryService
      .getTerritory(territoryId)
      .toPromise();
    this.userProfileMeansSubject.next(userTerritory.territoryData.means);
  }

  registerPlayer(user: IUser,): Promise<IUser> {
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
        return this.authHttpService
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

  // logout the user from the application and clean the storage
  logout(): void {
    this.authService.signOut();
    this.localStorageService.clearUser();
    this.navCtrl.navigateRoot('login');
  };
}

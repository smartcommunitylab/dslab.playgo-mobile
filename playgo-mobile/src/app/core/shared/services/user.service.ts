import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, merge, Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.model';
import localeItalian from '@angular/common/locales/it';
import { TransportType } from '../tracking/trip.model';
import { UserStorageService } from './user-storage.service';
import { TerritoryService } from './territory.service';
import { ReportService } from './report.service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { HttpClient } from '@angular/common/http';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { Avatar } from '../../api/generated/model/avatar';
import { Player } from '../../api/generated/model/player';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { PlayerStatus } from '../../api/generated/model/playerStatus';
import { IStatus } from '../model/status.model';
import { isEqual } from 'lodash-es';
import { Territory, TerritoryData } from '../model/territory.model';
@Injectable({ providedIn: 'root' })
export class UserService {
  private userLocale: string;
  private userProfile: IUser = null;
  public initUserProfile$: Observable<IUser> = this.authService.token$.pipe(
    filter((token) => token !== null),
    first(),
    switchMap(() => this.getUserProfile()),
    shareReplay(1)
  );
  public userProfileRefresher$ = new ReplaySubject<IUser>(1);

  private userProfileCouldBeChanged$ = merge(
    this.initUserProfile$,
    this.userProfileRefresher$
  );
  userProfile$: Observable<IUser> = this.userProfileCouldBeChanged$.pipe(
    switchMap(() => this.getUserProfile()),
    distinctUntilChanged(isEqual),
    shareReplay(1)
  );

  // public userStatusRefresher$ = new ReplaySubject<PlayerStatus>(1);
  public userProfileTerritory$: Observable<Territory> = combineLatest([
    this.userProfile$,
    this.territoryService.territories$,
  ]).pipe(
    map(([userProfile, territories]) =>
      territories.find(
        (territory) => territory.territoryId === userProfile.territoryId
      )
    )
  );
  public userProfileMeans$: Observable<TransportType[]> = combineLatest([
    this.userProfile$,
    this.territoryService.territories$,
  ]).pipe(
    map(
      ([userProfile, territories]) =>
        territories.find(
          (territory) => territory.territoryId === userProfile.territoryId
        ).territoryData.means
    )
  );
  constructor(
    private translateService: TranslateService,
    private reportService: ReportService,
    private territoryService: TerritoryService,
    private localStorageService: UserStorageService,
    private navCtrl: NavController,
    private authService: AuthService,
    private http: HttpClient,
    private playerControllerService: PlayerControllerService
  ) { }
  set locale(value: string) {
    this.userLocale = value;
  }
  get locale(): string {
    return this.userLocale || 'en-US';
  }

  uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', file);
    return this.playerControllerService
      .uploadPlayerAvatarUsingPOST(formData)
      .toPromise();
  }
  getAvatar(): Promise<Avatar> {
    return this.playerControllerService.getPlayerAvatarDataUsingGET().toPromise();
  }

  // getAvatarSmall(): Promise<any> {
  //   return this.http
  //     .request(
  //       'GET',
  //       environment.serverUrl.apiUrl + environment.serverUrl.avatarSmall,
  //       {
  //         responseType: 'blob',
  //       }
  //     )
  //     .toPromise();
  // }
  getAACUserInfo(): Promise<any> {
    return this.http
      .request('GET', environment.authConfig.server_host + '/userinfo')
      .toPromise();
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

  private async getUserProfile(): Promise<IUser> {
    let user = {};
    //check if locally present and I'm logged (store in the memory)
    try {
      user = await this.getProfile();
      if (!user) {
        //go to registration
        this.navCtrl.navigateRoot('/pages/registration');
      }
    } catch (e) {
      console.log(e);
    }
    //check if the avatar is present
    let avatar = null;
    // let avatarImageSmall = null;
    try {
      avatar = await this.getAvatar();
      // avatarImageSmall = await this.getAvatarSmall();
    } catch (e) {
      if (!avatar) {
        avatar.avatarSmallUrl = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
        avatar.avatarUrl = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
      }
    }
    if (user) {
      this.userProfile = user;
      this.processUser(user, avatar);
    }
    return Promise.resolve(user);
  }
  // private async getUserStatus(): Promise<PlayerStatus> {
  //   //get user status
  //   const status = await this.reportService.getStatus();
  //   if (status) {
  //     this.userStatus = status;
  //     // this.userStatusSubject.next(this.userStatus);
  //   }
  //   return Promise.resolve(status);
  // }
  public async startService() {
    //get user profile with avatars
    await this.getUserProfile();
    // await this.getUserStatus();
  }
  async updateImages(avatar) {
    //check if the avatar is present
    // let avatar = null;
    // try {
    //   // avatar = await this.getAvatar();
    //   // avatarImageSmall = await this.getAvatarSmall();
    // } catch (e) {
    //   if (!avatar) {
    //     avatar.avatarSmallUrl = await fetch(
    //       'assets/images/registration/generic_user.png'
    //     ).then((r) => r.blob());
    //     avatar.avatarUrl = await fetch(
    //       'assets/images/registration/generic_user.png'
    //     ).then((r) => r.blob());
    //   }

    // }
    this.processUser(this.userProfile, avatar);
  }
  processUser(user: IUser, avatar?: any) {
    if (avatar) {
      this.setUserAvatar(user, avatar);
    }
    this.setUserProfileMeans(user.territoryId);
    this.registerLocale(user.language);
    // this.userProfileRefresher$.next(user);
  }
  setUserAvatar(user: IUser, avatar: any) {
    //this.createImageFromBlob(user, avatar, avatarSmall);
    // if (!user.avatar) {
    //   user.avatar = {};
    // }
    user.avatar = avatar;

    // user.avatar.avatarData = avatar.avatarUrl;
    // user.avatar.avatarDataSmall = avatar.avatarSmallUrl;
  }
  // createImageFromBlob(user: IUser, userimage: Blob, userimageSmall: Blob) {
  //   const reader = new FileReader();
  //   reader.addEventListener(
  //     'load',
  //     () => {
  //       if (!user.avatar) {
  //         user.avatar = new Avatar();
  //       }
  //       user.avatar.avatarData = reader.result;
  //     },
  //     false
  //   );
  //   const readerSmall = new FileReader();
  //   readerSmall.addEventListener(
  //     'load',
  //     () => {
  //       if (!user.avatar) {
  //         user.avatar = new Avatar();
  //       }
  //       user.avatar.avatarDataSmall = reader.result;
  //     },
  //     false
  //   );
  //   if (userimage) {
  //     reader.readAsDataURL(userimage);
  //     readerSmall.readAsDataURL(userimageSmall);
  //   }
  // }
  async setUserProfileMeans(territoryId: string): Promise<TransportType[]> {
    //get territories means and set available means userProfileMeans$
    const userTerritory = await this.territoryService
      .getTerritory(territoryId)
      .toPromise();
    return Promise.resolve(userTerritory.territoryData.means);
    //this.userProfileMeansSubject.next(userTerritory.territoryData.means);
  }

  registerPlayer(user: IUser): Promise<IUser> {
    //TODO update local profile
    return this.playerControllerService
      .registerPlayerUsingPOST(user)
      .toPromise();
  }
  async isUserRegistered(): Promise<boolean> {
    try {
      const user = await this.playerControllerService
        .getProfileUsingGET()
        .toPromise();
      if (user) {
        //user registered
        return true;
      } else {
        //user not registered
        return false;
      }
    } catch (e) {
      {
        console.log(e);
        return false;
      }
    }
  }
  getProfile(): Promise<Player> {
    return this.playerControllerService.getProfileUsingGET().toPromise();
  }

  async updatePlayer(user: IUser): Promise<Player> {
    //TODO update local profile
    const player = await this.playerControllerService
      .updateProfileUsingPUT(user)
      .toPromise();
    this.processUser(user);
    return player;
  }

  // logout the user from the application and clean the storage
  logout(): void {
    this.authService.signOut();
    this.localStorageService.clearUser();
    this.navCtrl.navigateRoot('login');
  }
}

import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.model';
import localeItalian from '@angular/common/locales/it';
import { TransportType } from '../tracking/trip.model';
import { LocalStorageService } from './local-storage.service';
import { TerritoryService } from './territory.service';
import { Avatar } from '../model/avatar.model';
import { ReportService } from './report.service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { HttpClient } from '@angular/common/http';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { Player } from '../../api/generated/model/player';
import { shareReplay } from 'rxjs/operators';
import { PlayerStatus } from '../../api/generated/model/playerStatus';
@Injectable({ providedIn: 'root' })
export class UserService {
  private userProfileSubject = new ReplaySubject<IUser>();
  private userProfileMeansSubject = new ReplaySubject<TransportType[]>();
  private userStatusSubject = new ReplaySubject<PlayerStatus>();
  private userLocale: string;
  private userProfile: IUser = null;
  private userStatus: PlayerStatus = null;
  public userProfileMeans$: Observable<TransportType[]> =
    this.userProfileMeansSubject.asObservable();
  public userProfile$: Observable<IUser> = this.userProfileSubject
    .asObservable()
    .pipe(shareReplay());
  public userStatus$: Observable<IUser> = this.userStatusSubject
    .asObservable()
    .pipe(shareReplay());
  constructor(
    private translateService: TranslateService,
    private reportService: ReportService,
    private territoryService: TerritoryService,
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private authService: AuthService,
    private http: HttpClient,
    private playerControllerService: PlayerControllerService
  ) {
    this.authService.token$.subscribe(async (token) => {
      if (token) {
        this.startService();
      }
    });
  }
  set locale(value: string) {
    this.userLocale = value;
  }
  get locale(): string {
    return this.userLocale || 'en-US';
  }

  uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', file);
    return this.playerControllerService.uploadPlayerAvatarUsingPOST(formData).toPromise();
  }
  getAvatar(): Promise<any> {
    return this.http
      .request(
        'GET',
        environment.serverUrl.apiUrl + environment.serverUrl.avatar,
        {
          responseType: 'blob',
        }
      )
      .toPromise();
  }

  getAvatarSmall(): Promise<any> {
    return this.http
      .request(
        'GET',
        environment.serverUrl.apiUrl + environment.serverUrl.avatarSmall,
        {
          responseType: 'blob',
        }
      )
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
  public async startService() {
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
    let avatarImage = null;
    let avatarImageSmall = null;
    try {
      avatarImage = await this.getAvatar();
      avatarImageSmall = await this.getAvatarSmall();
    } catch (e) {
      if (!avatarImage) {
        avatarImage = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
      }
      if (!avatarImageSmall) {
        avatarImageSmall = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
      }
      //console.log(e);
    }
    if (user) {
      this.userProfile = user;
      this.processUser(user, avatarImage, avatarImageSmall);
      this.userProfileSubject.next(this.userProfile);
    }
    const status = await this.reportService.getStatus();
    if (status) {
      this.userStatus = status;
      this.userStatusSubject.next(this.userStatus);
    }
  }
  async updateImages() {
    //check if the avatar is present
    let avatarImage = null;
    let avatarImageSmall = null;
    try {
      avatarImage = await this.getAvatar();
      avatarImageSmall = await this.getAvatarSmall();
    } catch (e) {
      if (!avatarImage) {
        avatarImage = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
      }
      if (!avatarImageSmall) {
        avatarImageSmall = await fetch(
          'assets/images/registration/generic_user.png'
        ).then((r) => r.blob());
      }
    }
    this.processUser(this.userProfile, avatarImage, avatarImageSmall);
    this.userProfileSubject.next(this.userProfile);
  }
  processUser(user: IUser, avatar?: Blob, avatarSmall?: Blob) {
    if (avatar) {
      this.setUserAvatar(user, avatar, avatarSmall);
    }
    this.setUserProfileMeans(user.territoryId);
    this.registerLocale(user.language);
  }
  setUserAvatar(user: IUser, avatar: Blob, avatarSmall: Blob) {
    this.createImageFromBlob(user, avatar, avatarSmall);
  }
  createImageFromBlob(user: IUser, userimage: Blob, userimageSmall: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        if (!user.avatar) {
          user.avatar = new Avatar();
        }
        user.avatar.avatarData = reader.result;
        this.userProfileSubject.next(user);
      },
      false
    );
    const readerSmall = new FileReader();
    readerSmall.addEventListener(
      'load',
      () => {
        if (!user.avatar) {
          user.avatar = new Avatar();
        }
        user.avatar.avatarDataSmall = reader.result;
        this.userProfileSubject.next(user);
      },
      false
    );
    if (userimage) {
      reader.readAsDataURL(userimage);
      readerSmall.readAsDataURL(userimageSmall);
    }
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
    return this.playerControllerService.registerPlayerUsingPOST(user).toPromise();
  }
  async isUserRegistered(): Promise<boolean> {
    try {
      const user = await this.playerControllerService.getProfileUsingGET().toPromise();
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

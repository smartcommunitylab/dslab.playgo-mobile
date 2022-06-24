import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  combineLatest,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.model';
import localeItalian from '@angular/common/locales/it';
import { TransportType } from '../tracking/trip.model';
import { TerritoryService } from './territory.service';
import { ReportService } from './report.service';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { Avatar } from '../../api/generated/model/avatar';
import { Player } from '../../api/generated/model/player';
import { tapLog } from '../utils';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { LocalStorageService } from './local-storage.service';
import { Territory } from '../../api/generated/model/territory';
import { isOfflineError } from '../utils';
import { AlertService } from './alert.service';
import { AuthService } from '../../auth/auth.service';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userLanguage: string;
  private userLocale: string;
  private userProfile: IUser = null;
  private initUserProfile$: Observable<IUser> =
    this.authService.isReadyForApi$.pipe(
      switchMap(() => this.getUserProfile()),
      shareReplay(1)
    );
  public userProfileRefresher$: Subject<void> = new ReplaySubject<void>(1);

  private userProfileCouldBeChanged$ = merge(
    this.initUserProfile$,
    this.userProfileRefresher$
  );

  public userProfile$: Observable<IUser> = this.userProfileCouldBeChanged$.pipe(
    switchMap(() => this.getUserProfile()),
    distinctUntilChanged(isEqual),
    shareReplay(1)
  );

  private userStorage = this.localStorageService.getStorageOf<IUser>('user');

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
    private territoryService: TerritoryService,
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private authService: AuthService,
    private http: HttpClient,
    private playerControllerService: PlayerControllerService,
    private alertService: AlertService,
    private errorService: ErrorService
  ) {}

  /**
   * User language
   *
   * Format: 'it' / 'en'
   * Returned from server.
   * */
  public getLanguage(): 'it' | 'en' {
    return (this.userLanguage as 'it' | 'en') || 'it';
  }

  /**
   * User locale.
   *
   * Format is Unicode Locale Identifier. For example: 'it-IT' or 'en-US'.
   * Right now derived from the user language.
   * */
  public getLocale(): string {
    return this.userLocale || 'it-IT';
  }

  public uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', file);
    return this.playerControllerService
      .uploadPlayerAvatarUsingPOST(formData)
      .toPromise();
  }

  private getAvatar(): Promise<IUser['avatar']> {
    return this.playerControllerService
      .getPlayerAvatarUsingGET()
      .pipe(
        catchError((error) => of(null)),
        map((partialAvatar) => ({
          avatarSmallUrl:
            partialAvatar?.avatarSmallUrl ||
            'assets/images/registration/generic_user.png',
          avatarUrl:
            partialAvatar?.avatarUrl ||
            'assets/images/registration/generic_user.png',
        }))
      )
      .toPromise();
  }

  public getAACUserInfo(): Promise<any> {
    return this.http
      .request('GET', environment.authConfig.server_host + '/userinfo')
      .toPromise();
  }
  private registerLocale(locale: string) {
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
    let user: IUser;

    try {
      user = await this.getProfile();
      user.avatar = await this.getAvatar();
    } catch (e) {
      if (isOfflineError(e)) {
        user = this.userStorage.get();
      } else {
        throw e;
      }
    }

    if (!user) {
      this.navCtrl.navigateRoot('/pages/registration');
    }

    this.userProfile = user;
    await this.processUser(user);
    // store user with avatar
    this.userStorage.set(user);
    return user;
  }

  public async handleAfterUserRegistered() {
    //get user profile with avatars
    await this.getUserProfile();
  }

  public async updateImages(avatar) {
    this.userProfile.avatar = avatar;
  }

  private async processUser(user: IUser) {
    await this.setUserProfileMeans(user.territoryId);
    this.registerLocale(user.language);
  }

  private async setUserProfileMeans(
    territoryId: string
  ): Promise<TransportType[]> {
    //get territories means and set available means userProfileMeans$
    const userTerritory = await this.territoryService
      .getTerritory(territoryId)
      .toPromise();
    return userTerritory.territoryData.means;
  }

  public registerPlayer(user: IUser): Promise<IUser> {
    //TODO update local profile
    return this.playerControllerService
      .registerPlayerUsingPOST(user)
      .toPromise();
  }
  /**
   * Call api to test if user is registered
   *
   * @returns true / false / null = not known
   */
  public async isUserRegistered(): Promise<boolean | null> {
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
      // toto check local storage
      console.warn(e);
      return null;
    }
  }
  private getProfile(): Promise<Player> {
    return this.playerControllerService.getProfileUsingGET().toPromise();
  }

  public async updatePlayer(user: IUser): Promise<Player> {
    //TODO update local profile
    const player = await this.playerControllerService
      .updateProfileUsingPUT(user)
      .toPromise();
    this.processUser(user);
    return player;
  }
}

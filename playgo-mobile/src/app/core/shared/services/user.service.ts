import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.model';
import { TransportType } from '../tracking/trip.model';
import { TerritoryService } from './territory.service';
import { ReportService } from './report.service';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  private userLanguageSubject = new BehaviorSubject<'it' | 'en'>('it');
  public userLanguage$ = this.userLanguageSubject.pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );
  private userLocaleSubject = new BehaviorSubject<'it-IT' | 'en-US'>(null);
  public userLocale$ = this.userLocaleSubject.pipe(
    distinctUntilChanged(),
    filter((locale) => locale !== null),
    shareReplay(1)
  );

  private userProfile: IUser = null;

  public userProfileRefresher$: Subject<void> = new ReplaySubject<void>(1);

  private userProfileCouldBeChanged$ = merge(
    this.authService.isReadyForApi$.pipe(map(() => ({ isFirst: true }))),
    this.userProfileRefresher$.pipe(map(() => ({ isFirst: false })))
  );

  public userProfile$: Observable<IUser> = this.userProfileCouldBeChanged$.pipe(
    switchMap(async (trigger) => {
      try {
        return await this.getUserProfile();
      } catch (e) {
        this.errorService.handleError(
          e,
          trigger.isFirst ? 'blocking' : 'normal'
        );
        return EMPTY;
      }
    }),
    filter(Boolean),
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
    return this.userLanguageSubject.value;
  }

  /**
   * User locale.
   *
   * Format is Unicode Locale Identifier. For example: 'it-IT' or 'en-US'.
   * Right now derived from the user language.
   * */
  public getLocale(): 'it-IT' | 'en-US' {
    return this.userLocaleSubject.value;
  }

  /**
   * @throws http error
   */
  public uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', file);
    return this.playerControllerService
      .uploadPlayerAvatarUsingPOST(formData)
      .toPromise();
  }

  /**
   * do not throw http error
   */
  private getAvatar(): Promise<IUser['avatar']> {
    const avatarDefaults: IUser['avatar'] = {
      avatarSmallUrl: 'assets/images/registration/generic_user.png',
      avatarUrl: 'assets/images/registration/generic_user.png',
    };

    return this.playerControllerService
      .getPlayerAvatarUsingGET()
      .pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            (error.status === 404 || error.status === 400) &&
            error.error?.ex === 'avatar not found'
          ) {
            return of(avatarDefaults);
          }
          // we do not want to block app completely.
          this.errorService.handleError(error, 'normal');
          return of(avatarDefaults);
        }),
        map((avatar) => ({
          ...avatarDefaults,
          ...avatar,
        }))
      )
      .toPromise();
  }

  /**
   * @throws http error
   */
  public getAACUserInfo(): Promise<any> {
    return this.http
      .request('GET', environment.authConfig.server_host + '/userinfo')
      .toPromise();
  }
  /**
   * does not throw http error
   */
  private changeLanguage(language: string) {
    if (!language) {
      return;
    }
    this.translateService.use(language);
    this.userLanguageSubject.next(language as 'it' | 'en');
    switch (language) {
      case 'it': {
        this.userLocaleSubject.next('it-IT');
        break;
      }
      case 'en': {
        this.userLocaleSubject.next('en-US');
        break;
      }
    }
  }

  /**
   * @throws http error
   */
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
      return;
    }

    this.userProfile = user;
    await this.processUser(user);
    // store user with avatar
    this.userStorage.set(user);
    return user;
  }

  /**
   * @throws http error
   */
  public async handleAfterUserRegistered() {
    //get user profile with avatars
    await this.getUserProfile();
  }

  public async updateImages(avatar: any) {
    this.userProfile.avatar = avatar;
  }

  /**
   *
   * @param user
   * @throws http error
   */
  private async processUser(user: IUser) {
    await this.setUserProfileMeans(user.territoryId);
    this.changeLanguage(user.language);
  }

  /**
   *
   * @param territoryId
   * @returns list of means
   * @throws http error
   */
  private async setUserProfileMeans(
    territoryId: string
  ): Promise<TransportType[]> {
    //get territories means and set available means userProfileMeans$
    const userTerritory = await this.territoryService
      .getTerritory(territoryId)
      .toPromise();
    return userTerritory.territoryData.means;
  }

  /**
   *
   * @param user
   * @returns
   * @throws http error
   */
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
   *
   * does not throw http error
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

  /**
   *
   * @returns player profile
   * @throws http error
   */
  private getProfile(): Promise<Player> {
    return this.playerControllerService.getProfileUsingGET().toPromise();
  }

  /**
   *
   * @param user player profile
   * @returns updated player profile
   * @throws http error
   */
  public async updatePlayer(user: IUser): Promise<Player> {
    //TODO update local profile
    const player = await this.playerControllerService
      .updateProfileUsingPUT(user)
      .toPromise();
    this.processUser(user);
    return player;
  }
}

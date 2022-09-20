import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.model';
import { TransportType } from '../tracking/trip.model';
import { TerritoryService } from './territory.service';
import { NavController, RefresherCustomEvent } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { Player } from '../../api/generated/model/player';
import {
  catchError,
  distinctUntilChanged,
  filter,
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
import { RefresherService } from './refresher.service';
import { mapTo } from '../rxjs.utils';
import { Avatar } from '../../api/generated/model/avatar';

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
  public pluralRules$ = this.userLocale$.pipe(
    map((locale) => new Intl.PluralRules(locale)),
    shareReplay(1)
  );

  private userProfileEditedSubject = new Subject<void>();

  private userProfileCouldBeChanged$ = merge(
    this.authService.isReadyForApi$.pipe(mapTo({ isFirst: true })),
    this.userProfileEditedSubject.pipe(mapTo({ isFirst: false })),
    this.refresherService.refreshed$.pipe(mapTo({ isFirst: false }))
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

  constructor(
    private translateService: TranslateService,
    private territoryService: TerritoryService,
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private authService: AuthService,
    private http: HttpClient,
    private playerControllerService: PlayerControllerService,
    private refresherService: RefresherService,
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
  public async uploadAvatar(file: any): Promise<Avatar> {
    const formData = new FormData();
    formData.append('data', file);
    const avatar = await this.playerControllerService
      .uploadPlayerAvatarUsingPOST(formData)
      .toPromise();
    this.userProfileEditedSubject.next();
    return avatar;
  }

  /**
   * do not throw http error
   */
  private getAvatar(user: IUser): Promise<IUser['avatar']> {
    const avatarDefaults: IUser['avatar'] = {
      avatarSmallUrl: 'assets/images/registration/generic_user.png',
      avatarUrl: 'assets/images/registration/generic_user.png',
    };

    return this.playerControllerService
      .getPlayerAvatarUsingGET(user?.playerId)
      .pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            (error?.status === 404 ||
              error?.status === 400 ||
              error?.status === 500) &&
            error?.error?.ex === 'avatar not found'
          ) {
            return of(avatarDefaults);
          }
          // we do not want to block app completely.
          this.errorService.handleError(error, 'normal');
          return of(avatarDefaults);
        }),
        map((avatar) => ({
          ...avatarDefaults,
          ...{
            avatarSmallUrl: avatar.avatarSmallUrl + '?' + Date.now(),
            avatarUrl: avatar.avatarUrl + '?' + Date.now(),
          },
        }))
      )
      .toPromise();
  }
  /**
   * do not throw http error
   */
  public getOtherPlayerAvatar(playerId: string): Observable<IUser['avatar']> {
    const avatarDefaults: IUser['avatar'] = {
      avatarSmallUrl: 'assets/images/registration/generic_user.png',
      avatarUrl: 'assets/images/registration/generic_user.png',
    };

    return this.playerControllerService.getPlayerAvatarUsingGET(playerId).pipe(
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
    );
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
      if (user) {
        user.avatar = await this.getAvatar(user);
      }
      // this.updateTimestamp(user);
    } catch (e) {
      if (isOfflineError(e)) {
        user = await this.userStorage.get();
      } else {
        throw e;
      }
    }

    if (!user) {
      this.navCtrl.navigateRoot('/pages/registration');
      return;
    }

    this.changeLanguage(user.language);
    await this.storeUserInLocalStorage(user);
    return user;
  }
  // updateTimestamp(user: IUser) {
  //   user?.avatar?.avatarSmallUrl += '?' + Date.now();
  //   user?.avatar?.avatarUrl = user?.avatar?.avatarSmallUrl + '?' + Date.now();
  // }

  private async storeUserInLocalStorage(userWithAvatar: IUser) {
    const lastStoredUser = await this.userStorage.get();
    if (lastStoredUser && lastStoredUser.playerId !== userWithAvatar.playerId) {
      this.localStorageService.clearAll();
    }
    this.userStorage.set(userWithAvatar);
  }

  /**
   * @throws http error
   */
  public async handleAfterUserRegistered() {
    this.userProfileEditedSubject.next();
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
    this.userProfileEditedSubject.next();
    return player;
  }
  public async deleteAccount(): Promise<any> {
    return await this.playerControllerService
      .unregisterPlayerUsingPUT()
      .toPromise();
  }
}

import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TokenResponse } from '@openid/appauth';
import {
  AuthService as IonicAppAuthService,
  AuthActions,
  IAuthAction,
} from 'ionic-appauth';
import {
  filter,
  map,
  Observable,
  shareReplay,
  switchMap,
  take,
  first,
  lastValueFrom,
} from 'rxjs';
import { PlayerControllerService } from '../api/generated/controllers/playerController.service';
import { AlertService } from '../shared/services/alert.service';
import { LocalStorageService } from '../shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Wrapper around ionic-appauth service.
 */
export class AuthService {
  public isInitComplete$: Observable<void> =
    this.ionicAppAuthService.initComplete$.pipe(
      filter(Boolean),
      map(() => undefined),
      take(1),
      shareReplay(1)
    );

  public isAuthenticated$: Observable<boolean> = this.isInitComplete$.pipe(
    switchMap(() => this.ionicAppAuthService.isAuthenticated$),
    shareReplay(1)
  );

  public validToken$: Observable<TokenResponse> =
    this.ionicAppAuthService.token$.pipe(filter(Boolean), shareReplay(1));

  public isReadyForApi$: Observable<void> = this.validToken$.pipe(
    map(() => undefined),
    first(),
    shareReplay(1)
  );

  constructor(
    @Inject('IonicAppAuthService')
    private ionicAppAuthService: IonicAppAuthService,
    private alertService: AlertService,
    private router: Router,
    private navController: NavController,
    private localStorageService: LocalStorageService,
    private playerControllerService: PlayerControllerService
  ) {}

  public async init() {
    await this.ionicAppAuthService.init();
    this.ionicAppAuthService.events$.subscribe((action) => {
      if (action.action === AuthActions.SignInSuccess) {
        this.onSignInSuccess(action);
      }
      if (action.action === AuthActions.SignOutSuccess) {
        this.postLogoutCleanup();
      }
      if (action.action === AuthActions.SignOutFailed) {
        console.error('sign out failed', action);
        // there is nothing else to do...
        this.postLogoutCleanup();
      }

      if (
        action.action === AuthActions.SignInFailed ||
        action.action === AuthActions.RefreshFailed
      ) {
        console.error('auth error', action);
        this.logoutAfterAuthFailed();
      }
    });
  }

  /**
   * Waits for the first token available, but later it will return latest token immediately
   *
   * This api is just promise version of authService.validToken$
   * */
  public async getToken(): Promise<TokenResponse> {
    return await lastValueFrom(this.validToken$.pipe(take(1)));
  }

  public async login(): Promise<void> {
    // redirect is handled from global event subscription
    await this.ionicAppAuthService.signIn();
  }

  public async logout(): Promise<void> {
    // redirect is handled from global event subscription
    try {
      // in the future, we may not need to perform signOut, just delete the token. (from secure storage)
      await this.ionicAppAuthService.signOut();
    } catch (e) {
      console.log('sign out failed - probably no one is logged in', e);
      this.postLogoutCleanup();
    }
  }

  public async logoutAfterAuthFailed() {
    alert('You are not longer logged in, please log in again.');
    await this.ionicAppAuthService.signOut();
    // redirect should be handled from global event subscription,
    // but if not, we do it manually
    this.postLogoutCleanup();
  }

  private postLogoutCleanup() {
    this.localStorageService.clearAll();
    this.navController.navigateRoot('login');
  }

  public forceRefreshToken(): Promise<void> {
    return this.ionicAppAuthService.refreshToken();
  }

  /** called from EndSessionPage */
  public endSessionCallback() {
    this.ionicAppAuthService.endSessionCallback();
    this.navController.navigateRoot('login');
  }
  /** called from AuthCallbackPage */
  public authorizationCallback() {
    return this.ionicAppAuthService.authorizationCallback(
      window.location.origin + this.router.url
    );
  }

  private async onSignInSuccess(action: IAuthAction) {
    const userIsRegistered = await this.isUserRegistered();
    if (userIsRegistered === true) {
      this.alertService.showToast({ messageTranslateKey: 'login.welcome' });
      this.navController.navigateRoot('/pages/tabs/home');
    } else if (userIsRegistered === false) {
      this.navController.navigateRoot('/pages/registration');
    } else {
      // api call failed... but token should be there
      console.error(
        'failed to check if user is registered after log in!',
        action
      );
      this.navController.navigateRoot('login');
    }
  }

  /**
   * TODO: this could be included in the token response.
   *
   * We cannot use user service, because of the circular dependency.
   * */
  private async isUserRegistered(): Promise<boolean | null> {
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
}

import { Platform } from '@ionic/angular';
import { AuthService, Browser } from 'ionic-appauth';
import { Requestor } from '@openid/appauth/built/xhr';
import { StorageBackend } from '@openid/appauth/built/storage';
import { SpinnerService } from '../../shared/services/spinner.service';
import { environment } from 'src/environments/environment';
import { NgZone } from '@angular/core';

export const authFactory = (
  platform: Platform,
  ngZone: NgZone,
  requestor: Requestor,
  browser: Browser,
  storage: StorageBackend,
  spinnerService: SpinnerService
) => {
  browser.browserCloseListener((closeBrowserEvent: any) => {
    spinnerService.hide('login');
  });

  const authService = new AuthService(browser, storage, requestor);
  authService.authConfig = environment.authConfig;
  if (!platform.is('cordova')) {
    authService.authConfig.redirect_url =
      window.location.origin + '/auth/callback';
    authService.authConfig.end_session_redirect_url =
      window.location.origin + '/auth/endsession';
  }

  // Il listener appUrlOpen è gestito in modo centralizzato in app.component.ts
  return authService;
};
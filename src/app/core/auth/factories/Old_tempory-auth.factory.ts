import { Platform } from '@ionic/angular';
import { AuthService, Browser, IAuthConfig } from 'ionic-appauth';
import { App } from '@capacitor/app';
import { NgZone } from '@angular/core';
import { Requestor } from '@openid/appauth';
import { SpinnerService } from '../../shared/services/spinner.service';
import { TemporaryStorageBackend } from '../temporary-storage';

export function createTemporaryAuthService(
  platform: Platform,
  ngZone: NgZone,
  requestor: Requestor,
  browser: Browser,
  spinnerService: SpinnerService,
  config: {
    client_id: string;
    server_host: string;
    scopes: string;
  }
): AuthService {
  const storage = new TemporaryStorageBackend();
  
  browser.browserCloseListener(() => {
    try {
      spinnerService.hide('login');
    } catch (e) {
      console.warn('Browser close listener error', e);
    }
  });

  const authService = new AuthService(browser, storage, requestor);
  
  // Configura l'istanza con i parametri forniti
  const isNative = platform.is('capacitor') || platform.is('hybrid');
  const redirectUrl = isNative 
    ? 'it.dslab.playgo://campaign-auth-callback'
    : `${window.location.origin}/campaign-auth/callback`;

  const authConfig: IAuthConfig = {
    client_id: config.client_id,
    server_host: config.server_host,
    redirect_url: redirectUrl,
    end_session_redirect_url: redirectUrl,
    scopes: config.scopes,
    pkce: true,
  };

  authService.authConfig = authConfig;

  // Listener per callback native
  if (isNative) {
    App.addListener('appUrlOpen', (data: any) => {
      if (data?.url && data.url.indexOf(redirectUrl) === 0) {
        ngZone.run(() => {
          authService.authorizationCallback(data.url);
        });
      }
    });
  }

  return authService;
}
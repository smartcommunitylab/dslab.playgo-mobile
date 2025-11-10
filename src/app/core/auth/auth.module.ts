import { Platform } from '@ionic/angular';
import { StorageBackend } from '@openid/appauth/built/storage';
import { Requestor } from '@openid/appauth/built/xhr';
import { NgModule, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Browser } from 'ionic-appauth';
import {
  CapacitorBrowser,
  CapacitorSecureStorage,
} from 'ionic-appauth/lib/capacitor';

import { NgHttpService } from './ng-http.service';
import { authFactory } from './factories';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { SpinnerService } from '../shared/services/spinner.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: StorageBackend,
      useClass: CapacitorSecureStorage,
    },
    {
      provide: Requestor,
      useClass: NgHttpService,
    },
    {
      provide: Browser,
      useClass: CapacitorBrowser,
    },
    {
      provide: 'IonicAppAuthService',
      useFactory: authFactory,
      deps: [
        Platform,
        NgZone,
        Requestor,
        Browser,
        StorageBackend,
        SpinnerService,
      ],
    },
  ],
})
export class AuthModule {}

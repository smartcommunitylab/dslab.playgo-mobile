import { ErrorHandler, isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PlayGoSharedModule } from './core/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthModule } from './core/auth/auth.module';
import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation';
import { BackgroundGeolocationMock } from './core/shared/plugin-mocks/BackgroundGeolocationMock';
import { App } from '@capacitor/app';
import { AppPluginMock } from './core/shared/plugin-mocks/AppPluginMock';
import { GlobalErrorHandler } from './core/shared/services/global-error-handler';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    AuthModule,
    BrowserModule,
    PlayGoSharedModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: 'BackgroundGeolocationPlugin',
      useFactory: () =>
        useMock() ? BackgroundGeolocationMock : BackgroundGeolocation,
    },
    {
      provide: 'AppPlugin',
      useFactory: () => (useMock() ? AppPluginMock : App),
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

const useMock = () => isDevMode() && getPlatformId(window) === 'web';

// copied from capacitor core source (it is not exported)
const getPlatformId = (win: any): 'android' | 'ios' | 'web' => {
  if (win?.androidBridge) {
    return 'android';
  } else if (win?.webkit?.messageHandlers?.bridge) {
    return 'ios';
  } else {
    return 'web';
  }
};

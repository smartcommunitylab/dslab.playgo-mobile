import { NgModule } from '@angular/core';
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
import { Platform } from '@ionic/angular';
import { BackgroundGeolocationMock } from './core/shared/tracking/BackgroundGeolocationMock';

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
      provide: BackgroundGeolocation,
      useFactory: (platform: Platform) =>
        platform.is('desktop')
          ? // FIXME: only debug!
            BackgroundGeolocationMock
          : BackgroundGeolocation,
      deps: [Platform],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

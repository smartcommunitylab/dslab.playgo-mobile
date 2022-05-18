import { Platform } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { SplashScreen } from '@capacitor/splash-screen';
import { AfterContentInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundTrackingService } from './core/shared/tracking/background-tracking.service';
import { codePush } from 'capacitor-codepush';
import { environment } from 'src/environments/environment';
import { SyncStatus } from 'capacitor-codepush/dist/esm/syncStatus';
import { AppVersionService } from './core/app-version.service';
import { LocalTripsService } from './core/shared/tracking/local-trips.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterContentInit {
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private auth: AuthService,
    private backgroundTrackingService: BackgroundTrackingService,
    private localTripsService: LocalTripsService,
    private appVersionService: AppVersionService
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.translate.setDefaultLang('it');
    this.platform.ready().then(async () => {
      //TODO auto check if user is stored with token
      await this.auth.init();
      SplashScreen.hide();
    });
    this.codePushSync();
  }

  async codePushSync() {
    try {
      await this.platform.ready();
      let syncStatus: SyncStatus | 'sync_disabled' = 'sync_disabled';
      if (environment.useCodePush) {
        syncStatus = await codePush.sync({});
      }
      console.log('codePushSync syncStatus:', syncStatus);
    } catch (error) {
      console.error('codePushSync error:', error);
    } finally {
      this.appVersionService.codePushSyncFinished();
    }
  }
  ngAfterContentInit() {
    this.backgroundTrackingService.start();
    this.localTripsService.appStarted();
  }
}

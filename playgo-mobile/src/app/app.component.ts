/* eslint-disable @typescript-eslint/naming-convention */
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AfterContentInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundTrackingService } from './core/shared/tracking/background-tracking.service';
import { codePush } from 'capacitor-codepush';
import { environment } from 'src/environments/environment';
import { SyncStatus } from 'capacitor-codepush/dist/esm/syncStatus';
import { AppStatusService } from './core/shared/services/app-status.service';
import { IconService } from './core/shared/ui/icon/icon.service';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './core/shared/services/notifications/notifications.service';
import { BadgeService } from './core/shared/services/badge.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterContentInit {
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private backgroundTrackingService: BackgroundTrackingService,
    private appStatusService: AppStatusService,
    private iconService: IconService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private badgeService: BadgeService
  ) {
    this.initializeApp();
  }
  private async initializeApp() {
    this.translate.setDefaultLang('it');
    this.loadCustomIcons();
    this.pushInit();
    this.badgeService.init();
    await this.platform.ready();
    await Promise.all([
      this.authService.init(),
      this.codePushSync(),
      this.backgroundTrackingService.start(),
    ]);

    SplashScreen.hide();
  }
  pushInit() {
    this.authService.isReadyForApi$.subscribe(() => {
      //init push notification setup after login
      this.notificationService.initPush();
      console.log('Initializing HomePage');
    });
  }
  async codePushSync() {
    try {
      let syncStatus: SyncStatus | 'sync_disabled' = 'sync_disabled';
      if (environment.useCodePush) {
        syncStatus = await codePush.sync({});
      }
      console.log('codePushSync syncStatus:', syncStatus);
    } catch (error) {
      console.error('codePushSync error:', error);
    } finally {
      this.appStatusService.codePushSyncFinished();
    }
  }

  loadCustomIcons() {
    const icons = {
      custom_carpooling: '../assets/icon/carpooling.svg',
      cup: '../assets/icon/cup.svg',
      passenger: '../assets/icon/passenger.svg',
      driver: '../assets/icon/driver.svg',
      co2: '../assets/icon/co2.svg',
      flower: '../assets/icon/flower.svg',
      shield: '../assets/icon/shield.svg',
      offline: '../assets/icon/offline.svg',
      badges: '../assets/icon/badges.svg',
      blockUserColor: '../assets/icon/blockUserColor.svg',
      blacklist: '../assets/icon/blacklist.svg',
      invitation: '../assets/icon/invitation.svg',
      leaderboard: '../assets/icon/leaderboard.svg',
      stat: '../assets/icon/stat.svg',
      leave: '../assets/icon/leave.svg',
      groupCompetitivePerformance:
        '../assets/images/challenges/groupCompetitivePerformance.svg',
      groupCompetitiveTime:
        '../assets/images/challenges/groupCompetitiveTime.svg',
      groupCooperative: '../assets/images/challenges/groupCooperative.svg',
      default: '../assets/images/challenges/default.svg',
    };
    this.iconService.registerSvgIcons(icons);
  }

  ngAfterContentInit() {}
}

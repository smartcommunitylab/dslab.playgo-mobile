/* eslint-disable @typescript-eslint/naming-convention */
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AfterContentInit, Component, Inject, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundTrackingService } from './core/shared/tracking/background-tracking.service';
import { codePush as CodePushPluginInternal } from 'capacitor-codepush';
import { environment } from 'src/environments/environment';
import { SyncStatus } from 'capacitor-codepush/dist/esm/syncStatus';
import { AppStatusService } from './core/shared/services/app-status.service';
import { IconService } from './core/shared/ui/icon/icon.service';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './core/shared/services/notifications/notifications.service';
import { BadgeService } from './core/shared/services/badge.service';
import { waitMs } from './core/shared/utils';
import { ErrorService } from './core/shared/services/error.service';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterContentInit {
  @ViewChild('contentTemplateComponent', { static: true })
  contentTemplateComponent: any;
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private backgroundTrackingService: BackgroundTrackingService,
    private appStatusService: AppStatusService,
    private iconService: IconService,
    private authService: AuthService,
    private badgeService: BadgeService,
    @Inject('CodePushPlugin')
    private codePushPlugin: typeof CodePushPluginInternal,
    private errorService: ErrorService
  ) {
    this.initializeApp();
  }
  private async initializeApp() {
    try {
      this.translate.setDefaultLang('it');
      try {
        await window.screen.orientation.lock('portrait');
      } catch (e) { }
      this.loadCustomIcons();
      this.initLink();
      this.badgeService.init();
      await this.platform.ready();
      await this.authService.init();
      // wait max 3 seconds for codePushSync to finish
      await Promise.race([this.codePushSync(), waitMs(3000)]);
      await this.backgroundTrackingService.start();
    } catch (error) {
      console.error('initializeApp error:', error);
    } finally {
      await SplashScreen.hide();
    }
  }
  initLink() {
    if (Capacitor.getPlatform() !== 'web') {
      document.onclick = (event: any): boolean | void => {
        const element: any = event.target || event.srcElement;

        if (
          element.tagName === 'A' &&
          element.target === '_blank' &&
          element.href
        ) {
          event.preventDefault();
          Browser.open({
            url: element.href,
            windowName: '_system',
            presentationStyle: 'popover',
          });
          return true;
        }
      };
    }
  }

  async codePushSync() {
    try {
      let syncStatus: SyncStatus | 'sync_disabled' = 'sync_disabled';
      if (environment.useCodePush) {
        syncStatus = await Promise.race([
          this.codePushPlugin.sync({}),
          // there is some problem with error handling on the plugin side...
          // https://github.com/capacitor-community/http/issues/232
          waitMs(15_000).then(() => {
            throw new Error('codePushSync timeout');
          }),
        ]);
      }
      console.log('codePushSync syncStatus:', syncStatus);
      this.appStatusService.codePushSyncFinished(true);
    } catch (error) {
      this.errorService.handleError(error, 'silent');
      this.appStatusService.codePushSyncFinished(false);
    }
  }

  loadCustomIcons() {
    const icons = {
      custom_carpooling: '../assets/icon/travel/carpooling.svg',
      bike: '../assets/icon/travel/bike.svg',
      bus: '../assets/icon/travel/bus.svg',
      car: '../assets/icon/travel/custom_carpooling.svg',
      train: '../assets/icon/travel/train.svg',
      walk: '../assets/icon/travel/walk.svg',
      boat: 'boat',
      cup: '../assets/icon/cup.svg',
      passenger: '../assets/icon/passenger.svg',
      driver: '../assets/icon/driver.svg',
      co2: '../assets/icon/co2.svg',
      km: '../assets/icon/km.svg',
      flower: '../assets/icon/flower.svg',
      shield: '../assets/icon/shield.svg',
      ecoLeavesCompany: '../assets/icon/company-leaf.svg',
      ecoLeavesCity: '../assets/icon/city-eco-leave.svg',
      ecoLeavesHsc: '../assets/icon/hsc-eco-leaves.svg',
      offline: '../assets/icon/offline.svg',
      badges: '../assets/icon/badges.svg',
      blockUserColor: '../assets/icon/blockUserColor.svg',
      blacklist: '../assets/icon/blacklist.svg',
      invitation: '../assets/icon/invitation.svg',
      leaderboard: '../assets/icon/leaderboard.svg',
      homeFooter: '../assets/images/home/logo.svg',
      level_up: '../assets/icon/level-up.svg',
      stat: '../assets/icon/stat.svg',
      leave: '../assets/icon/leave.svg',
      cupCog: '../assets/icon/cupCog.svg',
      groupCompetitivePerformance:
        '../assets/images/challenges/groupCompetitivePerformance.svg',
      groupCompetitiveTime:
        '../assets/images/challenges/groupCompetitiveTime.svg',
      groupCooperative: '../assets/images/challenges/groupCooperative.svg',
      default: '../assets/images/challenges/default.svg',
    };
    this.iconService.registerSvgIcons(icons);
  }

  ngAfterContentInit() { }
}

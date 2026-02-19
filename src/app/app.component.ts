/* eslint-disable @typescript-eslint/naming-convention */
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AfterContentInit, Component, ViewChild, NgZone, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundTrackingService } from './core/shared/tracking/background-tracking.service';
import { AppStatusService } from './core/shared/services/app-status.service';
import { IconService } from './core/shared/ui/icon/icon.service';
import { AuthService } from './core/auth/auth.service';
import { BadgeService } from './core/shared/services/badge.service';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { environment } from 'src/environments/environment';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { AutoUpdateService } from './core/shared/services/auto-update.service';
import { UpdateCoordinatorService } from './core/shared/services/update-coordinator.service';
import { Router } from '@angular/router';
import { AuthFlowService } from './core/shared/services/auth-flow.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements AfterContentInit, OnInit, OnDestroy {
  @ViewChild('contentTemplateComponent', { static: true })
  contentTemplateComponent: any;

  // Update states
  showUpdateLoading = false;
  updateMessage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private backgroundTrackingService: BackgroundTrackingService,
    private appStatusService: AppStatusService,
    private iconService: IconService,
    private authService: AuthService,
    private authFlowService: AuthFlowService,
    private badgeService: BadgeService,
    private autoUpdateService: AutoUpdateService,
    private updateCoordinator: UpdateCoordinatorService,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.initializeApp();
    this.setupDeepLinks();
  }

  ngOnInit() {
    this.autoUpdateService.hotCodeUpdate$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.showUpdateLoading = status.isDownloading;
        if (status.isDownloading && status.latestVersion) {
          this.updateMessage = this.translate.instant('update.hotcode.downloading');
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private async initializeApp() {
    try {
      this.translate.setDefaultLang('it');
      
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (e) {
        console.log('Screen orientation lock not available');
      }

      this.loadCustomIcons();
      this.initLink();
      this.badgeService.init();
      
      await this.platform.ready();

      await this.autoUpdateService.init();

      App.addListener('appUrlOpen', (event: any) => {
        console.log('App aperta con URL:', event.url);
      });

      const observer = new MutationObserver(() => {
        document.documentElement.classList.remove('dark');
      });
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });

      // Initialize auth
      this.authService.init().catch(err => 
        console.error('auth init error', err)
      );

      // Start background tracking
      await this.backgroundTrackingService.start();

      // Check for updates after everything is initialized
      // Wait a bit to let the app settle
      setTimeout(() => {
        this.checkForUpdates();
      }, 3000);

    } catch (error) {
      console.error('initializeApp error:', error);
    } finally {
      StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3880ff' });
      StatusBar.setStyle({ style: Style.Light });
      await SplashScreen.hide();
    }
  }

  private async checkForUpdates() {
    if (Capacitor.getPlatform() === 'web') {
      console.log('⚠️ Update check skipped on web platform');
      return;
    }

    try {
      console.log('🔍 Checking for updates...');
      await this.updateCoordinator.checkAllUpdates();
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      // Non bloccare l'app se il controllo update fallisce
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

  private setupDeepLinks() {
    console.log('Setting up deep link listeners...');
    
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.ngZone.run(() => {
        const url = event.url;
        console.log('=== DEEP LINK RECEIVED ===');
        console.log('URL:', url);

        // Gestisci auth callback
        if (url.includes('auth/callback')) {
          this.handleAuthCallback(url);
        }
        // Gestisci end session
        else if (url.includes('auth/endsession')) {
          console.log('Handling end session callback');
          this.authService.endSessionCallback();
        }
        else {
          console.warn('Unhandled deep link:', url);
        }
        
        console.log('========================');
      });
    });
  }

  private async handleAuthCallback(url: string) {
    console.log('📱 Mobile: handleAuthCallback');
    console.log('URL:', url);
    
    try {
      const urlObj = new URL(url);
      const state = urlObj.searchParams.get('state');
      const isTempCallback = state?.startsWith('temp_');
  
      console.log('State:', state);
      console.log('Is temp:', isTempCallback);
  
      if (isTempCallback) {
        // Callback temporaneo campagna
        console.log('Processing temp callback...');
        await this.authFlowService.handleTemporaryAuthCallback(url);
  
        const campaignId = sessionStorage.getItem('pending_campaign_id');
        console.log('pending_campaign_id:', campaignId);
  
        // Naviga alla campagna
        setTimeout(() => {
          if (campaignId) {
            this.router.navigate(['/pages/tabs/campaigns/join', campaignId]);
          } else {
            this.router.navigate(['/pages/tabs/campaigns']);
          }
        }, 1000);
      } else {
        // Callback login principale
        console.log('Processing main callback...');
        this.authService.authorizationCallback();
  
        setTimeout(() => {
          this.router.navigate(['/pages/tabs/home']);
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling callback:', error);
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
      ecoLeavesGroup: '../assets/icon/star.svg',
      offline: '../assets/icon/offline.svg',
      badges: '../assets/icon/badges.svg',
      blockUserColor: '../assets/icon/blockUserColor.svg',
      blacklist: '../assets/icon/blacklist.svg',
      invitation: '../assets/icon/invitation.svg',
      invite: '../assets/icon/invite.svg',
      leaderboard: '../assets/icon/leaderboard.svg',
      homeFooter: '../assets/images/home/logo.svg',
      level_up: '../assets/icon/level-up.svg',
      stat: '../assets/icon/stat.svg',
      leave: '../assets/icon/leave.svg',
      checked: '../assets/icon/checked.svg',
      cupCog: '../assets/icon/cupCog.svg',
      groupCompetitivePerformance:
        '../assets/images/challenges/groupCompetitivePerformance.svg',
      groupCompetitiveTime:
        '../assets/images/challenges/groupCompetitiveTime.svg',
      groupCooperative: '../assets/images/challenges/groupCooperative.svg',
      default: '../assets/images/challenges/default.svg',
      listCircle: '../assets/images/challenges/list-circle-outline.svg'
    };
    this.iconService.registerSvgIcons(icons);
  }

  ngAfterContentInit() { }
}
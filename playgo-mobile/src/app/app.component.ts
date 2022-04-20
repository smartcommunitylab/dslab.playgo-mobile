import { Platform } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { SplashScreen } from '@capacitor/splash-screen';
import { AfterContentInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundTrackingService } from './core/shared/tracking/background-tracking.service';

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
    private backgroundTrackingService: BackgroundTrackingService
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
  }
  ngAfterContentInit() {
    this.backgroundTrackingService.start();
  }
}

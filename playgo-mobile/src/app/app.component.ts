import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'ionic-appauth';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private auth: AuthService,
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.translate.setDefaultLang('it');
    this.platform.ready().then(async () => {
      await this.auth.init();
      SplashScreen.hide();
    });


  }
}

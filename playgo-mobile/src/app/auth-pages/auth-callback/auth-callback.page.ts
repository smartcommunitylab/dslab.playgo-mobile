import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthActions, IAuthAction, AuthService } from 'ionic-appauth';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  templateUrl: './auth-callback.page.html',
})
export class AuthCallbackPage implements OnInit, OnDestroy {
  sub: Subscription;
  subToken: Subscription;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.postCallback(action)
    );
    this.auth.authorizationCallback(window.location.origin + this.router.url);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.subToken) {
      this.subToken.unsubscribe();
    }
  }

  async postCallback(action: IAuthAction) {
    console.log(JSON.stringify(action));
    if (action.action === AuthActions.SignInSuccess) {
      this.alertService.showToast({
        messageTranslateKey: 'login.welcome',
      });
      const userIsRegistered = await this.userService.isUserRegistered();
      if (userIsRegistered === true) {
        this.navCtrl.navigateRoot('/pages/tabs/home');
      } else if (userIsRegistered === false) {
        this.navCtrl.navigateRoot('/pages/registration');
      } else {
        // api call failed... but token should be there
        console.error(
          'failed to check if user is registered after log in!',
          action
        );
        this.navCtrl.navigateRoot('login');
      }
    }

    if (action.action === AuthActions.SignInFailed) {
      this.navCtrl.navigateRoot('login');
    }
  }
}

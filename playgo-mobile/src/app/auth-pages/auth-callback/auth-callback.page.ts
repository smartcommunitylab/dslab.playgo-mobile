import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  AuthActions,
  IAuthAction,
  AuthObserver,
  AuthService,
} from 'ionic-appauth';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.services';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/user/user.service';

@Component({
  templateUrl: './auth-callback.page.html',
})
export class AuthCallbackPage implements OnInit, OnDestroy {
  sub: Subscription;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.postCallback(action)
    );
    this.auth.authorizationCallback(window.location.origin + this.router.url);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async postCallback(action: IAuthAction) {
    console.log(JSON.stringify(action));
    if (action.action === AuthActions.SignInSuccess) {
      this.alertService.showToast(this.translateService.instant('login.welcome'));
      const userIsRegistered = await this.userService.isUserRegistered();
      if (userIsRegistered) {
        this.navCtrl.navigateRoot('/pages/tabs/home');
      }
      else {
        this.navCtrl.navigateRoot('/pages/registration');
      };

    }

    if (action.action === AuthActions.SignInFailed) {
      this.navCtrl.navigateRoot('login');
    }
  }
}

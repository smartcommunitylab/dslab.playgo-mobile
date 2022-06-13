import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAuthAction, AuthActions, AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  events$ = this.auth.events$;
  sub: Subscription;
  subToken: Subscription;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private translateService: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) => {
      if (action.action === AuthActions.SignInSuccess) {
        this.onSignInSuccess(action);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.subToken) {
      this.subToken.unsubscribe();
    }
  }

  private async onSignInSuccess(action: IAuthAction) {
    this.alertService.showToast({ messageTranslateKey: 'login.welcome' });
    // wait until token is ready
    this.subToken = this.auth.token$.subscribe(async (token) => {
      const userIsRegistered = await this.userService.isUserRegistered();
      if (userIsRegistered) {
        this.navCtrl.navigateRoot('/pages/tabs/home');
      } else {
        this.alertService.showToast(
          this.translateService.instant('registration.newUser')
        );
        this.navCtrl.navigateRoot('/pages/registration');
      }
    });

    if (action.action === AuthActions.SignInFailed) {
      this.navCtrl.navigateRoot('login');
    }
  }

  public signIn() {
    this.auth.signIn();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAuthAction, AuthActions, AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.services';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  events$ = this.auth.events$;
  sub: Subscription;

  constructor(private auth: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private translateService: TranslateService,
    private userService: UserService) { }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.onSignInSuccess(action)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private async onSignInSuccess(action: IAuthAction) {
    this.alertService.showToast(this.translateService.instant('login.welcome'));
    const userIsRegistered = await this.userService.isUserRegistered();
    if (userIsRegistered) {
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
    else {
      this.alertService.showToast(this.translateService.instant('registration.newUser'));
      this.navCtrl.navigateRoot('/pages/registration');
    };

    if (action.action === AuthActions.SignInFailed) {
      this.navCtrl.navigateRoot('login');
    }
  }

  public signIn() {
    this.auth.signIn();
  }
}

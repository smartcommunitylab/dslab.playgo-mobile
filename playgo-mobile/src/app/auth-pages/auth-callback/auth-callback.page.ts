import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthActions, IAuthAction, AuthService } from 'ionic-appauth';
import { Subject, Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/shared/services/user.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: './auth-callback.page.html',
})
export class AuthCallbackPage implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();
  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.auth.events$
      .pipe(takeUntil(this.componentIsDestroyed$))
      .subscribe((action) => {
        if (action.action === AuthActions.SignInSuccess) {
          this.userService.onSignInSuccess(action);
        }
        if (action.action === AuthActions.SignInFailed) {
          this.navCtrl.navigateRoot('login');
        }
      });

    this.auth.authorizationCallback(window.location.origin + this.router.url);
  }

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }
}

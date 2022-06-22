import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAuthAction, AuthActions, AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  private componentIsDestroyed$ = new Subject<boolean>();
  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
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
      });
  }

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }

  public signIn() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.auth.signIn({ idp_hint: 'ciao' });
  }
}

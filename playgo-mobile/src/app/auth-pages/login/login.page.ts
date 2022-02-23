import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAuthAction, AuthActions, AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  events$ = this.auth.events$;
  sub: Subscription;

  constructor(private auth: AuthService, private navCtrl: NavController) {}

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.onSignInSuccess(action)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onSignInSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignInSuccess) {
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
  }

  public signIn() {
    this.auth.signIn();
  }
}

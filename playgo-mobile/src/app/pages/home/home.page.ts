import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthActions, AuthService, IAuthAction } from 'ionic-appauth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  user$ = this.auth.user$;
  events$ = this.auth.events$;
  sub!: Subscription;

  constructor(private auth: AuthService, private navCtrl: NavController) {}

  public signOut() {
    this.auth.signOut();
  }

  public async getUserInfo(): Promise<void> {
    this.auth.loadUserInfo();
  }

  public async refreshToken(): Promise<void> {
    this.auth.refreshToken();
  }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.onSignOutSuccess(action)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onSignOutSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignOutSuccess) {
      this.navCtrl.navigateRoot('login');
    }
  }
}

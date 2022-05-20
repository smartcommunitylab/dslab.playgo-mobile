import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher, NavController } from '@ionic/angular';
import { AuthService, IAuthAction, AuthActions } from 'ionic-appauth';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { Subscription } from 'rxjs';
import { AppVersionService } from 'src/app/core/app-version.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;
  user$ = this.auth.user$;
  events$ = this.auth.events$;
  sub!: Subscription;
  subProfile!: Subscription;
  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private router: Router,
    public appVersionService: AppVersionService
  ) { }

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

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
    this.subProfile = this.userService.userProfileRefresher$.subscribe(() => {
      this.refresher.complete();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.subProfile.unsubscribe();
  }

  refresh() {
    //update status and profile
    this.userService.userProfileRefresher$.next();
    // this.userService.userStatusRefresher$.next();
  }
  private onSignOutSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignOutSuccess) {
      this.localStorageService.clearUser();
      this.navCtrl.navigateRoot('login');
    }
  }
}

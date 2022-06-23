import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher, NavController } from '@ionic/angular';
import { AuthService, IAuthAction, AuthActions } from 'ionic-appauth';
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
  subProfile!: Subscription;
  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    public appVersionService: AppVersionService
  ) {}

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  public async getUserInfo(): Promise<void> {
    this.auth.loadUserInfo();
  }

  public async refreshToken(): Promise<void> {
    this.auth.refreshToken();
  }

  showNotifications() {
    this.router.navigateByUrl('/pages/notifications');
  }
  ngOnInit() {
    this.subProfile = this.userService.userProfileRefresher$.subscribe(() => {
      this.refresher.complete();
    });
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
    this.subProfile.unsubscribe();
  }

  refresh() {
    //update status and profile
    this.userService.userProfileRefresher$.next();
  }
}

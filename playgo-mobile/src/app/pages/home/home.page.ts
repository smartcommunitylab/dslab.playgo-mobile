import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { PushNotificationService } from 'src/app/core/shared/services/notifications/pushNotification.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;
  subProfile!: Subscription;
  constructor(
    private userService: UserService,
    private router: Router,
    public appStatusService: AppStatusService,
    private pushNotificationService: PushNotificationService
  ) {}

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  showNotifications() {
    this.router.navigateByUrl('/pages/notifications');
  }
  ngOnInit() {
    this.subProfile = this.userService.userProfileRefresher$.subscribe(() => {
      this.refresher.complete();
    });

    //init push notification setup after login
    this.pushNotificationService.initPush();
    console.log('Initializing HomePage');
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

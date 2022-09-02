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
    private router: Router,
    public appStatusService: AppStatusService
  ) {}

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  showNotifications() {
    this.router.navigateByUrl('/pages/notifications');
  }
  ngOnInit() {}

  ngOnDestroy() {
    this.subProfile.unsubscribe();
  }
}

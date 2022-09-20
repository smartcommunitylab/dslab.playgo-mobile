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
  constructor(private router: Router) {}

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  showNotifications() {
    this.router.navigateByUrl('/pages/notifications');
  }
  ngOnInit() {}

  ngOnDestroy() {}
}

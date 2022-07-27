import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification } from '../../core/api/generated/model/notification';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {
  subNotification: Subscription;
  notifications: Notification[];
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subNotification = this.notificationService
      .getAnnouncementNotifications()
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }
  ngOnDestroy() {
    this.subNotification.unsubscribe();
  }
}

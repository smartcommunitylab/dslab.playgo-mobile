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
  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    console.log('ngOnInit');
    this.subNotification = this.notificationService
      .getAnnouncementNotifications()
      .subscribe((notifications) => {
        console.log('notifications', notifications);
        this.notifications = notifications;
        this.notifications.sort((a, b) => b.timestamp - a.timestamp);
        //mark all the unreaded notifications as readed
      });
  }
  ngOnDestroy() {
  }
  ionViewDidLeave() {
    this.subNotification.unsubscribe();
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { DetailNotificationModalPage } from 'src/app/core/shared/detail-notification/detail-notification.modal';
import {
  NotificationService,
  NotificationType,
} from 'src/app/core/shared/services/notifications/notifications.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-campaign-notification',
  templateUrl: './campaign-notification.component.html',
  styleUrls: ['./campaign-notification.component.scss'],
})
export class CampaignNotificationComponent implements OnInit {
  @Input()
  notification: Notification;
  @Input()
  campaign: PlayerCampaign;

  constructor(
    private modalController: ModalController,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}
  async openDetail(notification: Notification) {
    const modal = await this.modalController.create({
      component: DetailNotificationModalPage,
      cssClass: 'campaign-notification',
      componentProps: {
        notification,
        campaign: this.campaign,
      },
    });
    await modal.present();
    //mark as read the notification
    this.notificationService.markListOfNotificationAsRead([notification]);
    await modal.onWillDismiss();
  }
  getTitle(notification: Notification) {
    switch (notification?.content?.type) {
      case NotificationType.level:
        return this.translateService.instant('modal.levelup');
      case NotificationType.badge:
        return this.translateService.instant('modal.newbadge');
      default:
        return '';
    }
  }
  getImage(notification: Notification) {
    switch (notification?.content?.type) {
      case NotificationType.level:
        return 'leaderboard';
      case NotificationType.badge:
        return 'badges';
      default:
        return '';
    }
  }
}

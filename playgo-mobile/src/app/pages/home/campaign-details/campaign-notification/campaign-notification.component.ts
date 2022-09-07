import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { DetailNotificationModalPage } from 'src/app/core/shared/detail-notification/detail-notification.modal';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-campaign-notification',
  templateUrl: './campaign-notification.component.html',
  styleUrls: ['./campaign-notification.component.scss'],
})
export class CampaignNotificationComponent implements OnInit {
  @Input()
  notification: Notification;

  constructor(
    private modalController: ModalController,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {}
  async openDetail(notification: Notification) {
    const modal = await this.modalController.create({
      component: DetailNotificationModalPage,
      cssClass: 'modalConfirm',
      componentProps: {
        notification,
      },
    });
    await modal.present();
    //mark as read the notification
    this.notificationService.markListOfNotificationAsRead([notification]);
    await modal.onWillDismiss();
  }
}

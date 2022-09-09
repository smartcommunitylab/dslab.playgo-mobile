import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Notification } from '../../api/generated/model/notification';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { NotificationType } from '../services/notifications/notifications.service';
@Component({
  selector: 'app-detail-notification-modal',
  templateUrl: './detail-notification.modal.html',
  styleUrls: ['./detail-notification.modal.scss'],
})
export class DetailNotificationModalPage implements OnInit {
  notification: Notification;
  campaign: PlayerCampaign;
  notificationType = NotificationType;

  constructor(private modalController: ModalController) {}
  ngOnInit() {}
  close() {
    this.modalController.dismiss(false);
  }
}

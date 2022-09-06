import { Component, OnInit } from '@angular/core';
import { PushNotificationSchema } from '@capacitor/push-notifications';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-notification.modal',
  templateUrl: './notification.modal.html',
  styleUrls: ['./notification.modal.scss'],
})
export class NotificationModalPage implements OnInit {
  notification: PushNotificationSchema;

  constructor(private modalController: ModalController) {}
  ngOnInit() {}

  close() {
    this.modalController.dismiss(false);
  }
}

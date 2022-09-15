import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Notification } from 'src/app/core/api/generated/model/notification';

@Component({
  selector: 'app-notification.modal',
  templateUrl: './notification.modal.html',
  styleUrls: ['./notification.modal.scss'],
})
export class NotificationDetailModalPage implements OnInit {
  notification: Notification;

  constructor(private modalController: ModalController) {}
  ngOnInit() {}

  close() {
    this.modalController.dismiss(false);
  }
}

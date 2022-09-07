import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-unsubscribe.modal',
  templateUrl: './unsubscribe.modal.html',
  styleUrls: ['./unsubscribe.modal.scss'],
})
export class UnsubscribeModalPage implements OnInit {
  constructor(private modalController: ModalController) {}
  ngOnInit() {}

  close() {
    this.modalController.dismiss(false);
  }
  confirm() {
    this.modalController.dismiss(true);
  }
}

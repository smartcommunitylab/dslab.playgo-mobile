import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-info-challenge.modal',
  templateUrl: './info-challenge.modal.html',
  styleUrls: ['./info-challenge.modal.scss'],
})
export class InfoChallengeModalPage implements OnInit {
  constructor(private modalController: ModalController) {}
  ngOnInit() {}

  close() {
    this.modalController.dismiss(false);
  }
}

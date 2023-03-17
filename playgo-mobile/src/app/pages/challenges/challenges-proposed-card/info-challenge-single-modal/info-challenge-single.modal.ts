import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-info-challenge.modal',
  templateUrl: './info-challenge-single.modal.html',
  styleUrls: ['./info-challenge-single.modal.scss'],
})
export class InfoChallengeSingleModalPage implements OnInit {
  constructor(private modalController: ModalController) { }
  ngOnInit() { }

  close() {
    this.modalController.dismiss(false);
  }
}

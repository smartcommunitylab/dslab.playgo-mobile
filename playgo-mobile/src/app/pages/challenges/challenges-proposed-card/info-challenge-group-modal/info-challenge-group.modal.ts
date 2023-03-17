import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-info-challenge-group.modal',
  templateUrl: './info-challenge-group.modal.html',
  styleUrls: ['./info-challenge-group.modal.scss'],
})
export class InfoChallengeGroupModalPage implements OnInit {
  constructor(private modalController: ModalController) { }
  ngOnInit() { }

  close() {
    this.modalController.dismiss(false);
  }
}

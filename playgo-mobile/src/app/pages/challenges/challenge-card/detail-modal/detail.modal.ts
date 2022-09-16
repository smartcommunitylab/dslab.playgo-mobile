import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Challenge } from '../../challenges.page';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail.modal.html',
  styleUrls: ['./detail.modal.scss'],
})
export class DetailChallengenModalPage implements OnInit {
  challenge: Challenge;

  constructor(private modalController: ModalController) {}
  ngOnInit() {}
  close() {
    this.modalController.dismiss(false);
  }
}

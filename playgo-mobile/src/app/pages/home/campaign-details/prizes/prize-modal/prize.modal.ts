import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';

@Component({
  selector: 'app-prize-modal',
  templateUrl: './prize.modal.html',
  styleUrls: ['./prize.modal.scss'],
})
export class PrizeModalPage implements OnInit {
  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}

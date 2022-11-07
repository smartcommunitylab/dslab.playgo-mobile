import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail.modal.html',
  styleUrls: ['./detail.modal.scss'],
})
export class DetailCampaignModalPage implements OnInit {
  type = 'playgo';
  detail: CampaignDetail;

  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}

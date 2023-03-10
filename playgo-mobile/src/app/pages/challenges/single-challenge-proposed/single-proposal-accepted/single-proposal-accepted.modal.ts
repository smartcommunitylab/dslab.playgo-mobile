import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../../challenges.page';

@Component({
  selector: 'app-single-proposal-accepted',
  templateUrl: './single-proposal-accepted.modal.html',
  styleUrls: ['./single-proposal-accepted.modal.scss'],
})
export class SingleProposalAcceptedModalPage implements OnInit {
  challenge: Challenge;
  campaign: PlayerCampaign;

  constructor(
    private modalController: ModalController,
    public campaignService: CampaignService,
  ) { }
  ngOnInit() { }
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
}

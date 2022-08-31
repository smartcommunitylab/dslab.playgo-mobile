import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from '../challenges.page';
import { SingleProposalModalPage } from './single-proposal/single-proposal.modal';

@Component({
  selector: 'app-single-challenge-proposed',
  templateUrl: './single-challenge-proposed.component.html',
  styleUrls: ['./single-challenge-proposed.component.scss'],
})
export class SingleChallengeProposedComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  constructor(private modalController: ModalController) {}

  ngOnInit() {}
  async openSelectionPopup() {
    const modal = await this.modalController.create({
      component: SingleProposalModalPage,
      componentProps: {
        challenge: this.challenge,
        campaign: this.campaign,
      },
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
}

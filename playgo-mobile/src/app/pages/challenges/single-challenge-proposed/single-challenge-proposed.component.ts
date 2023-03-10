import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from '../challenges.page';
import { SingleProposalAcceptedModalPage } from './single-proposal-accepted/single-proposal-accepted.modal';
import { SingleProposalModalPage } from './single-proposal/single-proposal.modal';

@Component({
  selector: 'app-single-challenge-proposed',
  templateUrl: './single-challenge-proposed.component.html',
  styleUrls: ['./single-challenge-proposed.component.scss'],
})
export class SingleChallengeProposedComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  constructor(private modalController: ModalController) { }

  ngOnInit() { }
  async openSelectionPopup() {
    let modal = await this.modalController.create({
      component: SingleProposalModalPage,
      cssClass: 'modal-challenge',
      componentProps: {
        challenge: this.challenge,
        campaign: this.campaign,
      },
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      modal = await this.modalController.create({
        component: SingleProposalAcceptedModalPage,
        cssClass: 'modal-challenge',
        componentProps: {
          challenge: this.challenge,
          campaign: this.campaign,
        },
        swipeToClose: true,
      });
      await modal.present();
      await modal.onWillDismiss();
    }
  }
}

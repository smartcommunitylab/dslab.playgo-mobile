import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { Challenge } from '../../challenges.page';

@Component({
  selector: 'app-single-proposal',
  templateUrl: './single-proposal.modal.html',
  styleUrls: ['./single-proposal.modal.scss'],
})
export class SingleProposalModalPage implements OnInit {
  challenge: Challenge;
  campaign: PlayerCampaign;

  constructor(
    private modalController: ModalController,
    private challengeService: ChallengeService,
    public campaignService: CampaignService
  ) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
  async activate() {
    try {
      const ret = await this.challengeService.acceptChallenge(
        this.campaign,
        this.challenge
      );
      this.challengeService.challengesRefresher$.next(null);
    } catch (e) {
    } finally {
      this.modalController.dismiss(false);
    }
  }
}

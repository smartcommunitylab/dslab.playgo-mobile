import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
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
    public campaignService: CampaignService,
    private errorService: ErrorService
  ) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
  async activate() {
    try {
      await this.challengeService.acceptSingleChallenge(
        this.campaign,
        this.challenge
      );
    } catch (e) {
      this.errorService.handleError(e);
    } finally {
      this.modalController.dismiss(false);
    }
  }
}

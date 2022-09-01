import { Component, Input, OnInit } from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';
import { getImgChallenge } from '../../../core/shared/utils';
import { Browser } from '@capacitor/browser';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-challenges-proposed-card',
  templateUrl: './challenges-proposed-card.component.html',
  styleUrls: ['./challenges-proposed-card.component.scss'],
})
export class ChallengesProposedCardComponent implements OnInit {
  @Input() challenges: Challenge[];
  @Input() campaign: PlayerCampaign;
  @Input() type: string;
  @Input() canInvite: boolean;
  imgChallenge = getImgChallenge;
  singleChallenges: Challenge[] = [];
  coupleChallenges: Challenge[] = [];
  constructor(
    public campaignService: CampaignService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    console.log(this.canInvite);
    this.singleChallenges = this.challenges.filter(
      (challenge) => challenge.otherAttendeeData == null
    );
    this.coupleChallenges = this.challenges.filter(
      (challenge) => challenge.otherAttendeeData != null
    );
  }
  goToCreateChallenge(event: Event, campaign: PlayerCampaign) {
    this.navCtrl.navigateRoot(
      `/pages/tabs/challenges/create-challenge/${campaign.campaign.campaignId}`
    );
  }
}

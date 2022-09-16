import { Component, Input, OnInit } from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';
import { getImgChallenge } from '../../../core/shared/utils';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
})
export class ChallengeCardComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() type: string;
  imgChallenge = getImgChallenge;
  constructor(public campaignService: CampaignService) {}

  ngOnInit() {}

  fillSurvey() {
    Browser.open({
      url: this.challenge.extUrl,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  getUnitChallenge(challenge: Challenge) {
    return challenge?.unit?.toLowerCase().includes('km'.toLowerCase());
  }
}

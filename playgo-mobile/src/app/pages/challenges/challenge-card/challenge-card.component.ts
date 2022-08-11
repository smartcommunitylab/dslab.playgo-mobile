import { Component, Input, OnInit } from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
})
export class ChallengeCardComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() type: string;
  constructor(public campaignService: CampaignService) {}

  ngOnInit() {}
  getImgChallenge() {
    if (
      [
        'groupCooperative',
        'groupCompetitiveTime',
        'groupCompetitivePerformance',
      ].indexOf(this.challenge.type) > -1
    ) {
      return this.challenge.type;
    }
    return 'default';
  }
  fillSurvey() {
    console.log('fill survey');
  }
}

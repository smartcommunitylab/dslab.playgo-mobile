import { Component, Input, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from 'src/app/pages/challenges/challenges.page';
import { getImgChallenge } from '../../campaign.utils';

@Component({
  selector: 'app-active-challenge',
  templateUrl: './active-challenge.component.html',
  styleUrls: ['./active-challenge.component.scss'],
})
export class ActiveChallengeComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  imgChallenge = getImgChallenge;
  type = 'active';
  constructor() {}

  ngOnInit() {}
  fillSurvey() {
    console.log('fill survey');
  }
}

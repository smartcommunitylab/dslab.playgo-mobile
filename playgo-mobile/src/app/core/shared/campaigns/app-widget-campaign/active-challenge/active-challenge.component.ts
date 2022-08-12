import { Component, Input, OnInit } from '@angular/core';
import { Challenge } from 'src/app/pages/challenges/challenges.page';
import { getImgChallenge } from '../../../../../core/shared/utils';

@Component({
  selector: 'app-active-challenge',
  templateUrl: './active-challenge.component.html',
  styleUrls: ['./active-challenge.component.scss'],
})
export class ActiveChallengeComponent implements OnInit {
  @Input() challenge: Challenge;
  imgChallenge = getImgChallenge;
  type = 'active';
  constructor() {}

  ngOnInit() {}
  fillSurvey() {
    console.log('fill survey');
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-challenge-bar-status',
  templateUrl: './challenge-bar-status.component.html',
  styleUrls: ['./challenge-bar-status.component.scss'],
})
export class ChallengeBarStatusComponent implements OnInit {
  @Input() status: number;
  @Input() rowStatus: number;
  @Input() otherStatus?: number;
  @Input() type: string;
  @Input() campaignType: string;
  @Input() challengeType: string;
  // @Input() position?: string;

  constructor() { }

  ngOnInit() {
    // console.log(this.status);
    console.log(this.challengeType);
  }
  getWidth(status: number) {
    if (this.challengeType === 'groupCompetitiveTime') {
      return `calc(${status / 2}% - 8px)`;
    }
    return `calc(${status}% - 8px)`;
  }
  getColor(type: string) {
    if (type === 'school') {
      return 'var(--ion-color-school)';
    }
    if (type === 'city') {
      return 'var(--ion-color-city)';
    }
    return 'var(--ion-color-personal)';
  }
  getBackgroundColor(type: string) {
    if (type === 'school') {
      return 'var(--ion-color-school)';
    }
    if (type === 'city') {
      return 'var(--ion-color-city)';
    }
    return 'var(--ion-color-personal)';
  }
}

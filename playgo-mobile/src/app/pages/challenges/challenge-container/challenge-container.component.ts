import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { trackByProperty } from 'src/app/core/shared/utils';
import { Challenge } from '../challenges.page';

@Component({
  selector: 'app-challenge-container',
  templateUrl: './challenge-container.component.html',
  styleUrls: ['./challenge-container.component.scss'],
})
export class ChallengeContainerComponent implements OnInit, OnChanges {
  @Input() campaign: PlayerCampaign;
  @Input() challenges: Challenge[];
  @Input() type: string;
  @Input() canInvite: boolean;
  @Input() team?: boolean = false;
  challengeProposed: Challenge[];
  challengeTracking = trackByProperty<Challenge>('challId');

  constructor(public campaignService: CampaignService) { }

  ngOnInit() { }
  ngOnChanges() {
    this.challengeProposed = this.challenges?.filter(
      (challenge) => challenge.challengeType === 'PROPOSED'
    );
    this.challenges?.map((chall) => {
      if (chall.challengeType === 'FUTURE' && chall.otherAttendeeData) {
        this.canInvite = false;
      }
    });
    // console.log(this.challengeProposed);
  }
}

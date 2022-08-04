import { Component, Input, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { trackByProperty } from 'src/app/core/shared/utils';
import { Challenge } from '../challenges.page';

@Component({
  selector: 'app-challenge-container',
  templateUrl: './challenge-container.component.html',
  styleUrls: ['./challenge-container.component.scss'],
})
export class ChallengeContainerComponent implements OnInit {
  @Input() campaign: PlayerCampaign;
  @Input() challenges: Challenge[];
  @Input() type: string;
  challengeTracking = trackByProperty<Challenge>('challId');

  constructor(public campaignService: CampaignService) {}

  ngOnInit() {}
}

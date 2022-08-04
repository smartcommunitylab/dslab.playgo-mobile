import { Component, OnDestroy, OnInit } from '@angular/core';
import { flatten } from 'lodash-es';
import {
  EMPTY,
  forkJoin,
  map,
  merge,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { ChallengeConceptInfo } from 'src/app/core/api/generated/model/challengeConceptInfo';
import { ChallengesData } from 'src/app/core/api/generated/model/challengesData';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { trackByProperty } from 'src/app/core/shared/utils';

@Component({
  selector: 'app-challenges',
  templateUrl: 'challenges.page.html',
  styleUrls: ['challenges.page.scss'],
})
export class ChallengesPage implements OnInit, OnDestroy {
  selectedSegment?: string;
  subCampaignChall: Subscription;
  campaignsWithChallenges: PlayerCampaign[] = [];
  // public pastChallenges$: Observable<Challenge[]> =
  //   this.challengeService.pastChallenges$;
  public activeChallenges$: Observable<Challenge[]> =
    this.challengeService.activeChallenges$;
  public futureChallenges$: Observable<Challenge[]> =
    this.challengeService.futureChallenges$;

  challengeTracking = trackByProperty<Challenge>('challId');

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.selectedSegment = 'activeChallenges';
    this.subCampaignChall =
      this.challengeService.campaignsWithChallenges$.subscribe((campaigns) => {
        this.campaignsWithChallenges = campaigns;
      });
    this.subCampaignActiveChall =
      this.challengeService.campaignsWithChallenges$.subscribe((campaigns) => {
        this.campaignsWithChallenges = campaigns;
      });
    this.subCampaignActiveChall =
      this.challengeService.campaignsWithChallenges$.subscribe((campaigns) => {
        this.campaignsWithChallenges = campaigns;
      });
  }

  ngOnDestroy(): void {}
}

export interface Challenge extends ChallengesData {
  challengeType: ChallengeType;
  campaign: Campaign;
}

export type ChallengeType = 'ACTIVE' | 'FUTURE' | 'OLD' | 'PROPOSED';

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
  subCampaignFutureChall: Subscription;
  subCampaignActiveChall: Subscription;
  campaignsWithChallenges: PlayerCampaign[] = [];
  activeChallenges: any = {};
  futureChallenges: any = {};
  // public pastChallenges$: Observable<Challenge[]> =
  //   this.challengeService.pastChallenges$;
  public activeChallenges$: Observable<Challenge[]> =
    this.challengeService.activeChallenges$;
  public futureChallenges$: Observable<Challenge[]> =
    this.challengeService.futureChallenges$;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.selectedSegment = 'activeChallenges';
    this.subCampaignChall =
      this.challengeService.campaignsWithChallenges$.subscribe((campaigns) => {
        this.campaignsWithChallenges = campaigns;
      });
    this.subCampaignActiveChall =
      this.challengeService.activeChallenges$.subscribe((challenges) => {
        // this.activeChallenges = challenges.reduce(
        //   (result, item) => ({ ...result, [item.campaign.campaignId]: item }),
        //   {}
        // );
        this.activeChallenges = challenges.reduce(
          (result: any, a) => (
            (result[a.campaign.campaignId] =
              result[a.campaign.campaignId] || []).push(a),
            result
          ),
          {}
        );
      });
    this.subCampaignFutureChall =
      this.challengeService.futureChallenges$.subscribe((challenges) => {
        this.futureChallenges = challenges.reduce(
          (result: any, a) => (
            (result[a.campaign.campaignId] =
              result[a.campaign.campaignId] || []).push(a),
            result
          ),
          {}
        );
      });
  }

  ngOnDestroy(): void {}
}

export interface Challenge extends ChallengesData {
  challengeType: ChallengeType;
  campaign: Campaign;
}

export type ChallengeType = 'ACTIVE' | 'FUTURE' | 'OLD' | 'PROPOSED';

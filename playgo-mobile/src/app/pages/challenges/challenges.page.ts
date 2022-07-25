import { Component, OnDestroy, OnInit } from '@angular/core';
import { flatten } from 'lodash-es';
import {
  EMPTY,
  forkJoin,
  map,
  merge,
  Observable,
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
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { trackByProperty } from 'src/app/core/shared/utils';

@Component({
  selector: 'app-challenges',
  templateUrl: 'challenges.page.html',
  styleUrls: ['challenges.page.scss'],
})
export class ChallengesPage implements OnInit, OnDestroy {
  selectedSegment?: string;

  private campaignsWithChallenges$ = this.campaignService.myCampaigns$.pipe(
    map((campaigns) =>
      // TODO: ask if the condition is correct
      campaigns.filter((campaign) => campaign.campaign.type === 'city')
    )
  );

  public allChallenges$: Observable<Challenge[]> =
    this.campaignsWithChallenges$.pipe(
      switchMap((campaigns) =>
        forkJoin(
          campaigns.map((campaign) =>
            this.challengeControllerService
              .getChallengesUsingGET({
                campaignId: campaign.campaign.campaignId,
              })
              .pipe(
                this.errorService.getErrorHandler(),
                map((response) =>
                  this.processResponseForOneCampaign(response, campaign)
                )
              )
          )
        ).pipe(map((challengesPerCampaign) => flatten(challengesPerCampaign)))
      )
    );

  public activeChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'ACTIVE')
    )
  );
  public pastChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'OLD')
    )
  );
  public futureChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter(
        (challenge) =>
          challenge.challengeType === 'FUTURE' ||
          challenge.challengeType === 'PROPOSED'
      )
    )
  );

  challengeTracking = trackByProperty<Challenge>('challId');

  constructor(
    private campaignService: CampaignService,
    private challengeControllerService: ChallengeControllerService,
    private errorService: ErrorService
  ) {}

  private processResponseForOneCampaign(
    response: ChallengeConceptInfo,
    campaign: PlayerCampaign
  ): Challenge[] {
    const challengesOfAllTypesPerOneCampaign = Object.entries(
      response.challengeData
    ).flatMap(([challengeType, challenges]) =>
      challenges.map((challenge) => ({
        ...challenge,
        challengeType: challengeType as ChallengeType,
        campaign: campaign.campaign,
      }))
    );
    return challengesOfAllTypesPerOneCampaign;
  }

  ngOnInit(): void {
    this.selectedSegment = 'activeChallenges';
  }

  ngOnDestroy(): void {}
}

export interface Challenge extends ChallengesData {
  challengeType: ChallengeType;
  campaign: Campaign;
}

export type ChallengeType = 'ACTIVE' | 'FUTURE' | 'OLD' | 'PROPOSED';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { flatten } from 'lodash-es';
import { EMPTY, map, merge, Observable, switchMap, tap, toArray } from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { ChallengeConceptInfo } from 'src/app/core/api/generated/model/challengeConceptInfo';
import { ChallengesData } from 'src/app/core/api/generated/model/challengesData';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
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
        merge(
          ...campaigns.map((campaign) =>
            this.challengeControllerService.getChallengesUsingGET({
              campaignId: campaign.campaign.campaignId,
            })
          )
        ).pipe(
          toArray(),
          map((responses) => this.processResponsesForAllCampaigns(responses))
        )
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
    private challengeControllerService: ChallengeControllerService
  ) {}

  private processResponsesForAllCampaigns(
    responses: ChallengeConceptInfo[]
  ): Challenge[] {
    const challengesPerCampaign = responses.map(
      (challengesOfAllTypesPerOneCampaignMap: ChallengeConceptInfo) => {
        const challengesOfAllTypesPerOneCampaign = Object.entries(
          challengesOfAllTypesPerOneCampaignMap.challengeData
        ).flatMap(([challengeType, challenges]) =>
          challenges.map((challenge) => ({
            ...challenge,
            challengeType: challengeType as ChallengeType,
          }))
        );
        return challengesOfAllTypesPerOneCampaign;
      }
    );
    const challengesForAllCampaigns = flatten(challengesPerCampaign);
    return challengesForAllCampaigns;
  }

  ngOnInit(): void {
    this.selectedSegment = 'activeChallenges';
  }

  ngOnDestroy(): void {}
}

interface Challenge extends ChallengesData {
  challengeType: ChallengeType;
  // TODO: campaign: PlayerCampaign (we will need better operator than merge + toArray)
}

type ChallengeType = 'ACTIVE' | 'FUTURE' | 'OLD' | 'PROPOSED';

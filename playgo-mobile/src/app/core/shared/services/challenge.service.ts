import { Injectable } from '@angular/core';
import { flatten } from 'lodash-es';
import { map, Observable, switchMap, forkJoin, shareReplay } from 'rxjs';
import {
  Challenge,
  ChallengeType,
} from 'src/app/pages/challenges/challenges.page';
import { ChallengeControllerService } from '../../api/generated/controllers/challengeController.service';
import { ChallengeConceptInfo } from '../../api/generated/model/challengeConceptInfo';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { CampaignService } from './campaign.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {
  public campaignsWithChallenges$ = this.campaignService.myCampaigns$.pipe(
    map((campaigns) =>
      // TODO: ask if the condition is correct
      campaigns.filter(
        (campaign) =>
          campaign.campaign.type === 'city' ||
          campaign.campaign.type === 'school'
      )
    ),
    shareReplay(1)
  );

  public allChallenges$: Observable<Challenge[]> = this.campaignsWithChallenges$
    .pipe(
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
    )
    .pipe(shareReplay(1));

  public activeChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'ACTIVE')
    ),
    shareReplay(1)
  );
  public pastChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'OLD')
    ),
    shareReplay(1)
  );
  public futureChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map(
      (challenges) =>
        challenges.filter(
          (challenge) =>
            challenge.challengeType === 'FUTURE' ||
            challenge.challengeType === 'PROPOSED'
        ),
      shareReplay(1)
    )
  );
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
  public getChallengeStats(arg0: {
    campaignId: string;
    playerId: any;
    groupMode: import('luxon').DateTimeUnit;
    dateFrom: string;
    dateTo: string;
  }) {
    return this.challengeControllerService.getChallengeStatsUsingGET(arg0);
  }
  public getAllChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.allChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        )
      ),
      shareReplay(1)
    );
  }
  public getBlacklistByCampaign(
    campaignId: string
  ): Observable<Array<{ [key: string]: string }>> {
    return this.challengeControllerService.getBlackListUsingGET(campaignId);
  }
  public getActiveChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.activeChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        )
      ),
      shareReplay(1)
    );
  }

  public getPastChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.pastChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        )
      ),
      shareReplay(1)
    );
  }
  public getFutureChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.futureChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        )
      ),
      shareReplay(1)
    );
  }

  public removeBlacklist(campaignId: string, playerId: string) {
    return this.challengeControllerService
      .deleteFromBlackListUsingDELETE({
        campaignId,
        blockedPlayerId: playerId,
      })
      .toPromise();
  }
  public addBlacklist(campaignId: string, playerId: string) {
    return this.challengeControllerService
      .addToBlackListUsingPOST({
        campaignId,
        blockedPlayerId: playerId,
      })
      .toPromise();
  }
}

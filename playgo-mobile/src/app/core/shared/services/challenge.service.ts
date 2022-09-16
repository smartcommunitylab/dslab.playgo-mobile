import { Injectable } from '@angular/core';
import { flatten } from 'lodash-es';
import {
  map,
  Observable,
  switchMap,
  forkJoin,
  shareReplay,
  ReplaySubject,
  merge,
  startWith,
  withLatestFrom,
  EMPTY,
  catchError,
  of,
} from 'rxjs';
import {
  Challenge,
  ChallengeType,
} from 'src/app/pages/challenges/challenges.page';
import { ChallengeControllerService } from '../../api/generated/controllers/challengeController.service';
import { ChallengeConceptInfo } from '../../api/generated/model/challengeConceptInfo';
import { ChallengesData } from '../../api/generated/model/challengesData';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { CampaignService } from './campaign.service';
import { ErrorService } from './error.service';
import { RefresherService } from './refresher.service';

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
  public challengesRefresher$ = new ReplaySubject<any>(1);
  private challengesCouldBeChanged$ = merge(
    this.campaignsWithChallenges$,
    this.challengesRefresher$,
    this.refresherService.refreshed$
  ).pipe(withLatestFrom(this.campaignsWithChallenges$));

  public canInvite$: Observable<any[]> = this.campaignsWithChallenges$
    .pipe(
      switchMap((campaigns) =>
        forkJoin(
          campaigns.map((campaign) =>
            this.challengeControllerService
              .getChallengesUsingGET({
                campaignId: campaign.campaign.campaignId,
              })
              .pipe(
                this.errorService.getErrorHandler('silent'),
                map((response) =>
                  this.processResponseForCanInvite(response, campaign)
                )
              )
          )
        ).pipe(map((challengesPerCampaign) => flatten(challengesPerCampaign)))
      )
    )
    .pipe(shareReplay(1));
  public allChallenges$: Observable<Challenge[]> =
    this.challengesCouldBeChanged$
      .pipe(
        switchMap(([refresh, campaigns]) =>
          forkJoin(
            campaigns.map((campaign: PlayerCampaign) => {
              // console.log(campaign);
              if (campaign?.campaign) {
                return this.challengeControllerService
                  .getChallengesUsingGET({
                    campaignId: campaign.campaign.campaignId,
                  })
                  .pipe(
                    catchError((error) => {
                      this.errorService.handleError(error, 'silent');
                      return of(null);
                    }),
                    map((response) =>
                      this.processResponseForOneCampaign(response, campaign)
                    )
                  );
              } else {
                return of(null);
              }
            })
          ).pipe(map((challengesPerCampaign) => flatten(challengesPerCampaign)))
        )
      )
      .pipe(shareReplay(1));

  // public allChallenges$: Observable<Challenge[]> = this.campaignsWithChallenges$
  //   .pipe(
  //     switchMap((campaigns) =>
  //       forkJoin(
  //         campaigns.map((campaign) =>
  //           this.challengeControllerService
  //             .getChallengesUsingGET({
  //               campaignId: campaign.campaign.campaignId,
  //             })
  //             .pipe(
  //               this.errorService.getErrorHandler(),
  //               map((response) =>
  //                 this.processResponseForOneCampaign(response, campaign)
  //               )
  //             )
  //         )
  //       ).pipe(map((challengesPerCampaign) => flatten(challengesPerCampaign)))
  //     )
  //   )
  //   .pipe(shareReplay(1));

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
    private errorService: ErrorService,
    private refresherService: RefresherService
  ) {}
  private processResponseForOneCampaign(
    response: ChallengeConceptInfo,
    campaign: PlayerCampaign
  ): Challenge[] {
    if (response) {
      const challengesPerOneCampaign: Challenge[][] = Object.entries(
        response.challengeData
      ).map(([challengeType, challenges]) =>
        challenges.map((challenge) => ({
          ...challenge,
          challengeType: challengeType as ChallengeType,
          campaign: campaign.campaign,
        }))
      );
      const challengesOfAllTypesPerOneCampaign: Challenge[] = flatten(
        challengesPerOneCampaign
      );
      return challengesOfAllTypesPerOneCampaign;
    } else {
      return [];
    }
  }
  private processResponseForCanInvite(
    response: ChallengeConceptInfo,
    campaign: PlayerCampaign
  ): any {
    return {
      canInvite: response.canInvite,
      campaign: campaign.campaign,
    };
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
  ): Observable<Array<{ [key: string]: any }>> {
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
  public getActiveUncompletedChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.activeChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) =>
            challenge?.campaign?.campaignId === campaignId &&
            challenge?.status < 100
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
  public acceptSingleChallenge(campaign: PlayerCampaign, challenge: Challenge) {
    this.challengeControllerService
      .chooseChallengeUsingPUT({
        challengeId: challenge.challId,
        campaignId: campaign.campaign.campaignId,
      })
      .toPromise();
  }
  public acceptChallenge(campaign: PlayerCampaign, challenge: Challenge) {
    this.challengeControllerService
      .changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeName: challenge.challId,
        status: 'accept',
      })
      .toPromise();
  }
  public rejectChallenge(campaign: PlayerCampaign, challenge: Challenge) {
    this.challengeControllerService
      .changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeName: challenge.challId,
        status: 'refuse',
      })
      .toPromise();
  }
  public cancelChallenge(campaign: PlayerCampaign, challenge: Challenge) {
    this.challengeControllerService
      .changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeName: challenge.challId,
        status: 'cancel',
      })
      .toPromise();
  }
}

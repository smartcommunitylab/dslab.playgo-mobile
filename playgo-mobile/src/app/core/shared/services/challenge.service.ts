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
  firstValueFrom,
} from 'rxjs';
import {
  Challenge,
  ChallengeType,
} from 'src/app/pages/challenges/challenges.page';
import { ChallengeControllerService } from '../../api/generated/controllers/challengeController.service';
import { ChallengeConceptInfo } from '../../api/generated/model/challengeConceptInfo';
import { ChallengesData } from '../../api/generated/model/challengesData';
import { Invitation } from '../../api/generated/model/invitation';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { CampaignService } from './campaign.service';
import { ErrorService } from './error.service';
import { PushNotificationService } from './notifications/pushNotification.service';
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
  private challengesChangedSubject = new ReplaySubject<void>(1);
  private challengesCouldBeChanged$: Observable<PlayerCampaign[]> = merge(
    this.campaignsWithChallenges$,
    this.challengesChangedSubject,
    this.refresherService.refreshed$,
    this.pushNotificationService.notifications$
  ).pipe(
    withLatestFrom(this.campaignsWithChallenges$),
    map(([trigger, campaigns]) => campaigns)
  );

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
        switchMap((campaigns) =>
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
    private refresherService: RefresherService,
    private pushNotificationService: PushNotificationService
  ) { }
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
      canInvite: true,
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
  getInvitesChallengesByCampaign(campaignId: string): Observable<Challenge[]> {
    return EMPTY;
  }
  configureChallenges(campaignId: string): Observable<Challenge[]> {
    return EMPTY;
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
      map((challenges) => challenges.sort((a, b) => b.status - a.status)),
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

  public removeBlacklist(campaignId: string, playerId: string): Promise<any> {
    return this.challengeControllerService
      .deleteFromBlackListUsingDELETE({
        campaignId,
        blockedPlayerId: playerId,
      })
      .toPromise();
  }
  public addBlacklist(campaignId: string, playerId: string): Promise<any> {
    return this.challengeControllerService
      .addToBlackListUsingPOST({
        campaignId,
        blockedPlayerId: playerId,
      })
      .toPromise();
  }
  public async acceptSingleChallenge(
    campaign: PlayerCampaign,
    challenge: Challenge
  ): Promise<any> {
    const response = await firstValueFrom(
      this.challengeControllerService.chooseChallengeUsingPUT({
        challengeId: challenge.challId,
        campaignId: campaign.campaign.campaignId,
      })
    );

    this.challengesChangedSubject.next();
    return response;
  }
  public async acceptChallenge(
    campaign: PlayerCampaign,
    challenge: Challenge
  ): Promise<any> {
    const response = await firstValueFrom(
      this.challengeControllerService.changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeId: challenge.challId,
        status: 'accept',
      })
    );
    this.challengesChangedSubject.next();
    return response;
  }
  public rejectChallenge(
    campaign: PlayerCampaign,
    challenge: Challenge
  ): Promise<any> {
    return this.challengeControllerService
      .changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeId: challenge.challId,
        status: 'refuse',
      })
      .toPromise();
  }
  public async cancelChallenge(
    campaign: PlayerCampaign,
    challenge: Challenge
  ): Promise<any> {
    const res = await firstValueFrom(
      this.challengeControllerService.changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeId: challenge.challId,
        status: 'cancel',
      })
    );
    this.challengesChangedSubject.next(null);
    return res;
  }
  public async sendInvitation(invitationParams: {
    campaignId: string;
    body?: Invitation;
  }): Promise<any> {
    const invitation = await firstValueFrom(
      this.challengeControllerService.sendInvitationUsingPOST(invitationParams)
    );
    this.challengesChangedSubject.next();
    return invitation;
  }
}

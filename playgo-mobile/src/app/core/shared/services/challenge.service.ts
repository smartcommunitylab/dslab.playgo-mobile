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
  combineLatest,
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
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {


  public campaignsWithChallenges$ = this.campaignService.myCampaigns$.pipe(
    map((campaigns) =>
      // TODO: ask if the condition is correct
      campaigns.filter(
        (campaign) =>
          campaign.campaign.type === 'city'
          || campaign.campaign.type === 'school'
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


  public allChallengesTeam$: Observable<Challenge[]> =
    this.challengesCouldBeChanged$
      .pipe(
        switchMap((campaigns) =>
          forkJoin(
            campaigns.map((campaign: PlayerCampaign) => {
              if (campaign?.campaign && campaign.subscription?.campaignData?.teamId) {
                return this.challengeControllerService
                  .getChallengesByTeamUsingGET({
                    campaignId: campaign.campaign.campaignId,
                    teamId: campaign.subscription?.campaignData?.teamId,
                  })
                  .pipe(
                    catchError((error) => {
                      this.errorService.handleError(error, 'silent');
                      return of(null);
                    }),
                    map((response) =>
                      this.processResponseForOneCampaign(response, campaign, "team")
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

  public allChallenges$: Observable<Challenge[]> =
    this.challengesCouldBeChanged$
      .pipe(
        switchMap((campaigns) =>
          forkJoin(
            campaigns.map((campaign: PlayerCampaign) => {
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
                      this.processResponseForOneCampaign(response, campaign, "single")
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

  //team challenges
  public activeChallengesTeam$: Observable<Challenge[]> = this.allChallengesTeam$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge?.challengeType === 'ACTIVE')
    ),
    shareReplay(1)
  );
  public pastChallengesTeam$: Observable<Challenge[]> = this.allChallengesTeam$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge?.challengeType === 'OLD')
    ),
    shareReplay(1)
  );
  public proposedChallengesTeam$: Observable<Challenge[]> = this.allChallengesTeam$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge?.challengeType === 'PROPOSED')
    ),
    shareReplay(1)
  );
  public onlyFutureChallengesTeam$: Observable<Challenge[]> = this.allChallengesTeam$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge?.challengeType === 'FUTURE')
    ),
    shareReplay(1)
  );
  public futureChallengesTeam$: Observable<Challenge[]> = this.allChallengesTeam$.pipe(
    map(
      (challenges) =>
        challenges.filter(
          (challenge) =>
            challenge?.challengeType === 'FUTURE' ||
            challenge?.challengeType === 'PROPOSED'
        ),
      shareReplay(1)
    )
  );

  // single challenges
  public activeChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge?.challengeType === 'ACTIVE')
    ),
    shareReplay(1)
  );
  public pastChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'OLD')
    ),
    shareReplay(1)
  );
  public proposedChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'PROPOSED')
    ),
    shareReplay(1)
  );
  public onlyFutureChallenges$: Observable<Challenge[]> = this.allChallenges$.pipe(
    map((challenges) =>
      challenges.filter((challenge) => challenge.challengeType === 'FUTURE')
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
    private pushNotificationService: PushNotificationService,
    private userService: UserService
  ) { }
  private processResponseForOneCampaign(
    response: ChallengeConceptInfo,
    campaign: PlayerCampaign,
    kind: string
  ): Challenge[] {
    if (response) {
      const challengesPerOneCampaign: Challenge[][] = Object.entries(
        response.challengeData
      ).map(([challengeType, challenges]) =>
        challenges.map((challenge) => ({
          ...challenge,
          challengeType: challengeType as ChallengeType,
          campaign: campaign.campaign,
          kind
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
  public canInviteByCampaign(campaignId: string): Observable<boolean> {
    return this.canInvite$.pipe(
      map((canInvites) =>
        canInvites.filter(
          (canInvite) => canInvite?.campaign?.campaignId === campaignId && canInvite?.canInvite === true
        ).length > 0
      ),
      shareReplay(1)
    );
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
  public getActiveChallengesTeamByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.activeChallengesTeam$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        )
      ),
      shareReplay(1)
    );
  }
  //get invitations from other user with proposer !== from my id
  getInvitesChallengesByCampaign(campaignId: string): Observable<Challenge[]> {
    return combineLatest([
      this.userService.userProfile$,
      this.proposedChallenges$,
    ]).pipe(
      switchMap(([profile, challenges]) =>
        of(challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        ).filter((challenge) => challenge.proposerId !== null && challenge.proposerId !== profile.playerId)),
      ), shareReplay(1));
  }
  configurableChallenges(campaignId: string): Observable<Challenge[]> {
    return combineLatest([
      this.userService.userProfile$,
      this.canInvite$,
      this.proposedChallenges$,
    ]).pipe(
      switchMap(([profile, caninvites, challenges]) =>
        //filter by campaign id challenges proposed and if I can invite number of proposed (no invites) so
        //  challenge.proposerId == something and sendinvites is true
        of(challenges.filter(
          (challenge) => challenge?.campaign?.campaignId === campaignId
        ).filter((challenge) => challenge.proposerId === null)),
      ), shareReplay(1));
  }

  // of(challenges.filter(
  //   (challenge) => challenge?.campaign?.campaignId === campaignId
  // ).filter((challenge) => challenge.proposerId !== profile.playerId)),

  public getActiveUncompletedChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.activeChallenges$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) =>
            challenge?.campaign?.campaignId === campaignId &&
            !challenge?.success
        )
      ),
      map((challenges) => challenges.sort((a, b) => b.status - a.status)),
      shareReplay(1)
    );
  }
  public getActiveUncompletedChallengesTeamByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.activeChallengesTeam$.pipe(
      map((challenges) =>
        challenges.filter(
          (challenge) =>
            challenge?.campaign?.campaignId === campaignId &&
            !challenge?.success
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
  public getOnlyFutureChallengesByCampaign(
    campaignId: string
  ): Observable<Challenge[]> {
    return this.onlyFutureChallenges$.pipe(
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
  public async rejectChallenge(
    campaign: PlayerCampaign,
    challenge: Challenge
  ): Promise<any> {
    const res = await this.challengeControllerService
      .changeInvitationStatusUsingPOST({
        campaignId: campaign.campaign.campaignId,
        challengeId: challenge.challId,
        status: 'refuse',
      })
      .toPromise();
    this.challengesChangedSubject.next(null);
    return res;
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

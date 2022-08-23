import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { ChallengeChoice } from 'src/app/core/api/generated/model/challengeChoice';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { TranslateKey } from 'src/app/core/shared/type.utils';
import { tapLog } from 'src/app/core/shared/utils';
import { MeanOrGameInfo } from './select-challenge-mean/select-challenge-mean.component';

@Component({
  selector: 'app-create-challenge',
  templateUrl: './create-challenge.page.html',
  styleUrls: ['./create-challenge.page.scss'],
})
export class CreateChallengePage implements OnInit {
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id)
  );
  campaign$: Observable<Campaign> = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.myCampaigns$.pipe(
        map(
          (campaigns) =>
            campaigns.find(
              (campaignContainer) =>
                campaignContainer.campaign.campaignId === campaignId
            )?.campaign
        )
      )
    )
  );

  challengeModels$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.challengeControllerService
        .getChallengesStatusUsingGET(campaignId)
        .pipe(this.errorService.getErrorHandler())
    ),
    map((availableChallenges) => {
      const all: Omit<ChallengeModelOptions, 'available'>[] = [
        {
          challengeModelName: 'groupCompetitivePerformance',
          availableFromLevel: 13,
        },
        {
          challengeModelName: 'groupCompetitiveTime',
          availableFromLevel: 9,
        },
        {
          challengeModelName: 'groupCooperative',
          availableFromLevel: 0,
        },
      ];
      const allWithAvailableInfo = all.map((challengeModel) => {
        const serverState = availableChallenges.find(
          (eachServerChallengeMode) =>
            eachServerChallengeMode.modelName ===
            challengeModel.challengeModelName
        )?.state;
        return {
          ...challengeModel,
          // TODO: how to display 'ACTIVE'?
          available: serverState === 'AVAILABLE' || serverState === 'ACTIVE',
        };
      });
      return allWithAvailableInfo;
    })
  );

  selectedModelName$ = new Subject<Invitation.ChallengeModelNameEnum>();

  pointConcepts$: Observable<MeanOrGameInfo[]> = combineLatest([
    this.userService.userProfileMeans$,
    this.campaign$,
  ]).pipe(
    map(([means, campaign]) => {
      const gameInfo: MeanOrGameInfo = {
        isMean: false,
        icon: this.campaignService.getCampaignScoreIcon(campaign),
        name: 'game',
        title: this.campaignService.getCampaignScoreLabel(campaign),
      };
      const meansInfos: MeanOrGameInfo[] = means.map((mean) => ({
        isMean: true,
        icon: transportTypeIcons[mean],
        name: mean,
        title: transportTypeLabels[mean],
      }));
      return [gameInfo, ...meansInfos];
    })
  );
  selectedPointConcept$ = new Subject<string>();

  challengeables$: Observable<Challengeable[]> = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.challengeControllerService
        .getChallengeablesUsingGET(campaignId)
        .pipe(this.errorService.getErrorHandler())
    ),
    map((challengeables) =>
      challengeables.map((eachUser) => ({
        id: eachUser.id,
        nickname: eachUser.nickname,
        avatarUrl:
          eachUser?.avatar?.url ??
          'assets/images/registration/generic_user.png',
      }))
    )
  );

  selectedChallengeableId$ = new Subject<string>();

  previewActive$ = new Subject<void>();

  preview$ = combineLatest([
    this.campaignId$,
    this.selectedChallengeableId$,
    this.selectedModelName$,
    this.selectedPointConcept$,
  ]).pipe(
    switchMap((data) => this.previewActive$.pipe(map(() => data))),
    switchMap(
      ([
        campaignId,
        selectedChallengeableId,
        selectedModelName,
        selectedPointConcept,
      ]) => {
        console.log('Preview for:', {
          campaignId,
          selectedChallengeableId,
          selectedModelName,
          selectedPointConcept,
        });
        return this.challengeControllerService
          .getGroupChallengePreviewUsingPOST({
            campaignId,
            body: {
              attendeeId: selectedChallengeableId,
              challengeModelName: selectedModelName,
              challengePointConcept: selectedPointConcept,
            },
          })
          .pipe(this.errorService.getErrorHandler());
      }
    )
  );

  getCampaignColor = this.campaignService.getCampaignColor;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private challengeControllerService: ChallengeControllerService,
    private reportService: ReportService,
    private errorService: ErrorService,
    private userService: UserService
  ) {}

  ngOnInit() {}
}
export interface ChallengeModelOptions {
  challengeModelName: Invitation.ChallengeModelNameEnum;
  available: boolean;
  availableFromLevel: number;
}
export interface Challengeable {
  id: string;
  nickname: string;
  avatarUrl: string;
}

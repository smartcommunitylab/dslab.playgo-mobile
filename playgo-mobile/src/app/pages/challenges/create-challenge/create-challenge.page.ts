import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { find } from 'lodash-es';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { ChallengeChoice } from 'src/app/core/api/generated/model/challengeChoice';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { StringLanguageMap } from 'src/app/core/shared/pipes/languageMap.pipe';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  TransportType,
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { TranslateKey } from 'src/app/core/shared/type.utils';
import { castTo, tapLog } from 'src/app/core/shared/utils';

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

  challengeModels$: Observable<ChallengeModelOptions[]> = this.campaignId$.pipe(
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
        name: POINT_CONCEPT_GAME,
        title: this.campaignService.getCampaignScoreLabel(campaign),
      };
      const meansInfos: MeanOrGameInfo[] = means.map((mean) => ({
        isMean: true,
        icon: transportTypeIcons[mean],
        name: meanToPointConcept[mean],
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

  selectedChallengeable$: Observable<Challengeable> = combineLatest([
    this.challengeables$,
    this.selectedChallengeableId$,
  ]).pipe(
    map(([allChallengeables, selectedId]) =>
      find(allChallengeables, { id: selectedId })
    )
  );

  previewActive$ = new Subject<void>();

  preview$: Observable<ChallengePreview> = combineLatest([
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
          .pipe(
            this.errorService.getErrorHandler(),
            map((x) => ({
              description:
                'Unite le forze e fate almeno 10 km in bici. Se vincete la sfida, sia tu che user1 otterrete un bonus di 100 green leaves.',
              longDescription:
                'Se riuscirete a fare almeno 10 km in bici, sommando i km fatti da te e da user1, vi aggiudicherete la sfida e vincerete entrambi il premio di 100 green leaves.',
              params: {
                challengeTarget: 10.0,
                challengerBonusScore: 100.0,
                opponent: 'user1',
                reward: 100.0,
                rewardBonusScore: 100.0,
                target: 10.0,
              },
            })),
            castTo<ChallengePreview>()
          );
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

export type PointConceptMean =
  | 'Bike_Km'
  | 'Walk_Km'
  | 'Boat_Km'
  | 'Bus_Km'
  | 'Car_Km'
  | 'Train_Km';

export const POINT_CONCEPT_GAME = 'Green_Leaves';

export type PointConcept = PointConceptMean | typeof POINT_CONCEPT_GAME;

export const meanToPointConcept: Record<TransportType, PointConceptMean> = {
  bike: 'Bike_Km',
  walk: 'Walk_Km',
  boat: 'Boat_Km',
  bus: 'Bus_Km',
  car: 'Car_Km',
  train: 'Train_Km',
};

export type MeanOrGameInfo = {
  isMean: boolean;
  name: PointConcept;
  icon: string;
  title: TranslateKey;
};

export interface Challengeable {
  id: string;
  nickname: string;
  avatarUrl: string;
}
export interface ChallengePreview {
  description: StringLanguageMap;
  longDescription: StringLanguageMap;
}

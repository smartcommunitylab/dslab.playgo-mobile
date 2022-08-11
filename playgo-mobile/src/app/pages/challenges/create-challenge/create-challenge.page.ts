import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject, switchMap } from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
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

  playerLevel$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.reportService
        .getCurrentLevel(campaignId)
        .pipe(this.errorService.getErrorHandler())
    )
  );

  // challengeModels$ = this.campaignId$.pipe(
  //   switchMap((campaignId) =>
  //     this.challengeControllerService
  //       .getChallengesStatusUsingGET(campaignId)
  //       .pipe(this.errorService.getErrorHandler())
  //   ),
  //   map((challenges) =>
  //     challenges.map((eachChallengeType) => {
  //       const challengeModelOptions: ChallengeModelOptions = {
  //         challengeModelName:
  //           eachChallengeType.modelName as Invitation.ChallengeModelNameEnum,
  //         available: eachChallengeType.state === 'AVAILABLE',
  //         availableFromLevel: 0,
  //       };
  //       return challengeModelOptions;
  //     })
  //   )
  // );

  challengeModels$: Observable<ChallengeModelOptions[]> =
    this.playerLevel$.pipe(
      map((level) => {
        const models: Omit<ChallengeModelOptions, 'available'>[] = [
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
        return models.map((eachModel) => ({
          ...eachModel,
          available: eachModel.availableFromLevel <= level,
        }));
      })
    );

  selectedModelName$ = new Subject<Invitation.ChallengeModelNameEnum>();

  pointConcepts$ = this.userService.userProfileMeans$.pipe(
    map((means) => {
      const gameInfo: MeanOrGameInfo = {
        isMean: false,
        icon: 'game',
        name: 'game',
        title: 'game' as any,
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

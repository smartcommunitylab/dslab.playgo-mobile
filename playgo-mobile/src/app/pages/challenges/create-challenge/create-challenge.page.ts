import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { find } from 'lodash-es';
import {
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ChallengeControllerService } from 'src/app/core/api/generated/controllers/challengeController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { ChallengeChoice } from 'src/app/core/api/generated/model/challengeChoice';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { StringLanguageMap } from 'src/app/core/shared/pipes/languageMap.pipe';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  TransportType,
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { castTo, tapLog } from 'src/app/core/shared/rxjs.utils';
import { SentInvitationlModalPage } from './sent-invitation-modal/sent-invitation.modal';

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
          challengeModelName: 'groupCooperative',
          availableFromLevel: 4,
        },
        {
          challengeModelName: 'groupCompetitiveTime',
          availableFromLevel: 5,
        },
        {
          challengeModelName: 'groupCompetitivePerformance',
          availableFromLevel: 6,
        }
      ];
      const allWithAvailableInfo = all.map((challengeModel) => {
        const serverState = availableChallenges.find(
          (eachServerChallengeMode) =>
            eachServerChallengeMode.modelName ===
            challengeModel.challengeModelName
        )?.state;
        return {
          ...challengeModel,
          available: serverState === 'ACTIVE',
        };
      });
      return allWithAvailableInfo;
    })
  );

  selectedModelName$ = new Subject<Invitation.ChallengeModelNameEnum>();

  pointConcepts$: Observable<MeanOrGameInfo[]> = combineLatest([
    this.campaignService.availableMeans$,
    this.campaign$,
  ]).pipe(
    map(([means, campaign]) => {
      const gameInfo: MeanOrGameInfo = {
        isMean: false,
        icon: this.campaignService.getCampaignScoreIcon(campaign),
        name: POINT_CONCEPT_GAME,
        title: this.campaignService.getCampaignScoreLabel(campaign),
      };
      const meansInfos: MeanOrGameInfo[] = means
        .filter((mean) => meanToPointConcept[mean])
        .map((mean) => ({
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
    ),
    tap((chall) => (this.nicknameOpponent = chall.nickname))
  );

  previewActive$ = new Subject<void>();

  inviteParams$: Observable<{
    campaignId: string;
    body?: Invitation;
  }> = combineLatest({
    campaignId: this.campaignId$,
    selectedChallengeableId: this.selectedChallengeableId$,
    selectedModelName: this.selectedModelName$,
    selectedPointConcept: this.selectedPointConcept$,
  }).pipe(
    map(
      ({
        campaignId,
        selectedChallengeableId,
        selectedModelName,
        selectedPointConcept,
      }) => ({
        campaignId,
        body: {
          attendeeId: selectedChallengeableId,
          challengeModelName: selectedModelName,
          challengePointConcept: selectedPointConcept,
        },
      })
    ),
    shareReplay(1)
  );

  preview$: Observable<ChallengePreview> = this.inviteParams$.pipe(
    switchMap((data) => this.previewActive$.pipe(map(() => data))),
    switchMap((inviteParams) =>
      this.challengeControllerService
        .getGroupChallengePreviewUsingPOST(inviteParams)
        .pipe(this.errorService.getErrorHandler(), castTo<ChallengePreview>())
    )
  );

  getCampaignColor = this.campaignService.getCampaignColor;
  nicknameOpponent: string;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private challengeControllerService: ChallengeControllerService,
    private errorService: ErrorService,
    private navController: NavController,
    private challengeService: ChallengeService,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  async onInvite() {
    console.log('Invite!');
    const inviteParams = await firstValueFrom(this.inviteParams$);
    try {
      await this.challengeService.sendInvitation(inviteParams);
      // await this.alertService.presentAlert({
      //   messageString: JSON.stringify(invitation),
      // });
      const modal = await this.modalController.create({
        component: SentInvitationlModalPage,
        cssClass: 'modal-challenge',
        componentProps: {
          opponentName: this.nicknameOpponent,
        },
        swipeToClose: true,
      });
      await modal.present();
      const navigationExtras: NavigationExtras = {
        queryParams: {
          selectedSegment: 'futureChallenges'
        }
      };
      this.navController.navigateBack('pages/tabs/challenges', navigationExtras);
    } catch (e) {
      this.errorService.handleError(e);
    }
  }
}
export interface ChallengeModelOptions {
  challengeModelName: Invitation.ChallengeModelNameEnum;
  available: boolean;
  availableFromLevel: number;
}

export type PointConceptMean = 'Bike_Km' | 'Walk_Km';
// | 'Boat_Km'
// | 'Bus_Km'
// | 'Car_Km'
// | 'Train_Km';

export const POINT_CONCEPT_GAME = 'green leaves';

export type PointConcept = PointConceptMean | typeof POINT_CONCEPT_GAME;

export const meanToPointConcept: Record<
  TransportType,
  PointConceptMean | null
> = {
  bike: 'Bike_Km',
  walk: 'Walk_Km',
  boat: null,
  bus: null,
  car: null,
  train: null,
  unknown: null,
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

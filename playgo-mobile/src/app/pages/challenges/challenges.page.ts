import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, Subscription, combineLatest, forkJoin } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { ChallengesData } from 'src/app/core/api/generated/model/challengesData';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
import { ChallengeContainerComponent } from './challenge-container/challenge-container.component';

@Component({
  selector: 'app-challenges',
  templateUrl: 'challenges.page.html',
  styleUrls: ['challenges.page.scss'],
})
export class ChallengesPage implements OnInit, OnDestroy {
  @ViewChild('active', { static: false })
  activeChallengeChild: ChallengeContainerComponent;
  @ViewChild('future', { static: false })
  futureChallengeChild: ChallengeContainerComponent;

  selectedSegment?: string;
  subCampaignChall: Subscription;
  subCampaignFutureChall: Subscription;
  subCampaignActiveChall: Subscription;
  subCampaignCanInvite: Subscription;
  campaignsWithChallenges: PlayerCampaign[] = [];
  thereAreChallengeActive = false;
  thereAreChallengeFuture = false;
  activeChallenges: any = {};
  activeChallengesTeam: any = {};
  futureChallenges: any = {};
  futureChallengesTeam: any = {};
  canInvite: any = {};
  userCanInvite: boolean;
  // public pastChallenges$: Observable<Challenge[]> =
  //   this.challengeService.pastChallenges$;
  public activeChallenges$: Observable<Challenge[]> =
    this.challengeService.activeChallenges$;
  public futureChallenges$: Observable<Challenge[]> =
    this.challengeService.futureChallenges$;
  subSegment: Subscription;

  constructor(
    private challengeService: ChallengeService,
    private notificationService: NotificationService,
    public activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit(): void {

  }
  ionViewWillEnter() {
    this.selectedSegment = 'activeChallenges';
    this.subSegment = this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.selectedSegment) {
        //store the temp in data
        this.selectedSegment = params.selectedSegment;
      }
    });
    //mark common challenges notification as readed: activated, failed or completed
    this.notificationService.markCommonChallengeNotificationAsRead();
    this.subCampaignChall =
      this.challengeService.campaignsWithChallenges$.subscribe((campaigns) => {
        this.campaignsWithChallenges = campaigns;
      });
    this.subCampaignActiveChall =
      combineLatest(
        [
          this.challengeService.activeChallenges$,
          this.challengeService.activeChallengesTeam$
        ]
      )
        .subscribe(([active, team]) => {
          this.activeChallenges = active.reduce(
            (result: any, a) => (
              (result[a.campaign.campaignId] =
                result[a.campaign.campaignId] || []).push(a),
              result
            ),
            {}
          );
          this.activeChallengesTeam = team.reduce(
            (result: any, a) => (
              (result[a.campaign.campaignId] =
                result[a.campaign.campaignId] || []).push(a),
              result
            ),
            {}
          );
          if (active.length > 0 || team.length > 0) {
            this.thereAreChallengeActive = true;
          } else {
            this.thereAreChallengeActive = false;
          }
        });
    this.subCampaignFutureChall =
      combineLatest(
        [
          this.challengeService.futureChallenges$,
          this.challengeService.futureChallengesTeam$
        ]
      ).subscribe(([future, team]) => {
        this.futureChallenges = future.reduce(
          (result: any, a: any) => (
            (result[a.campaign.campaignId] =
              result[a.campaign.campaignId] || []).push(a),
            result
          ),
          {}
        );
        this.futureChallengesTeam = team.reduce(
          (result: any, a: any) => (
            (result[a.campaign.campaignId] =
              result[a.campaign.campaignId] || []).push(a),
            result
          ),
          {}
        );
        if (future.length > 0 || team.length > 0) {
          this.thereAreChallengeFuture = true;
        } else {
          this.thereAreChallengeFuture = false;
        }
      });
    this.subCampaignCanInvite = this.challengeService.canInvite$.subscribe(
      (canInvite) => {
        this.canInvite = canInvite.reduce(
          (result: any, a) => (
            (result[a.campaign.campaignId] = a.canInvite || false), result
          ),
          {}
        );
        this.userCanInvite = Object.values(this.canInvite).some(
          (x) => x === true
        );
      }
    );
  }
  ngOnDestroy(): void {

  }
  ionViewDidLeave() {
    this.subCampaignActiveChall?.unsubscribe();
    this.subCampaignCanInvite?.unsubscribe();
    this.subCampaignChall?.unsubscribe();
    this.subCampaignFutureChall?.unsubscribe();
    this.subSegment?.unsubscribe();
  }
}

export interface Challenge extends ChallengesData {
  challengeType: ChallengeType;
  campaign: Campaign;
}

export type ChallengeType = 'ACTIVE' | 'FUTURE' | 'OLD' | 'PROPOSED';

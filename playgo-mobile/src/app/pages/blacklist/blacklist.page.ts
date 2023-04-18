import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  map,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';

@Component({
  selector: 'app-blacklist-page',
  templateUrl: './blacklist.page.html',
  styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit, OnDestroy {
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  private campaignId: string;
  public blacklistRefresher$: Subject<void> = new ReplaySubject<void>(1);
  private blacklistCouldBeChanged$ = merge(
    this.authService.isReadyForApi$.pipe(map(() => ({ isFirst: true }))),
    this.blacklistRefresher$.pipe(map(() => ({ isFirst: false })))
  );
  public blacklist$: Observable<Array<{ [key: string]: any }>>;
  subId: Subscription;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  constructor(
    private challengeService: ChallengeService,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private authService: AuthService,
    private pageSettingsService: PageSettingsService,
    private campaignService: CampaignService
  ) { }

  ngOnInit() {
    this.subId = this.campaignId$.subscribe((campaignId) => {
      this.campaignId = campaignId;
      this.blacklist$ = this.blacklistCouldBeChanged$.pipe(
        switchMap(() =>
          this.challengeService.getBlacklistByCampaign(campaignId)
        )
      );
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === campaignId
          );
        }
      );
    });
  }

  async removeBlacklist(playerId: string) {
    try {
      const removed = await this.challengeService.removeBlacklist(
        this.campaignId,
        playerId
      );
      this.blacklistRefresher$.next();
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    }
  }

  ionViewWillEnter() {
    this.changePageSettings();
  }

  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }
  ngOnDestroy(): void {
    this.subCampaign.unsubscribe();
    this.subId.unsubscribe();
  }
}

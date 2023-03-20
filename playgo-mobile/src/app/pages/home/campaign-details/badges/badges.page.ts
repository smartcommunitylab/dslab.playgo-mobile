import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { BadgeCollectionConcept } from 'src/app/core/api/generated/model/badgeCollectionConcept';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { ReportService } from 'src/app/core/shared/services/report.service';

@Component({
  selector: 'app-badges-page',
  templateUrl: './badges.page.html',
  styleUrls: ['./badges.page.scss'],
})
export class BadgesPage implements OnInit, OnDestroy {
  badges: Array<BadgeCollectionConcept> = [];
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  subId: Subscription;
  subStatus: Subscription;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private pageSettingsService: PageSettingsService,
    private campaignService: CampaignService
  ) { }

  ngOnInit() {
    this.subId = this.campaignId$.subscribe((campaignId) => {
      this.subStatus = this.reportService
        .getGameStatus(campaignId)
        .subscribe((status) => (this.badges = status?.badges));

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
    this.subStatus.unsubscribe();
  }
}

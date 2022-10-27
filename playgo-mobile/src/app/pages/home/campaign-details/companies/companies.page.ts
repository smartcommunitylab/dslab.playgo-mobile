import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { ReportService } from 'src/app/core/shared/services/report.service';

@Component({
  selector: 'app-detail-page',
  templateUrl: './companies.page.html',
  styleUrls: ['./companies.page.scss'],
})
export class CompaniesCampaignPage implements OnInit, OnDestroy {
  campaign?: Campaign;
  companies: any;
  subCampaignId: Subscription;
  subCampaignContainer: Subscription;
  campaignContainer: PlayerCampaign;

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private pageSettingsService: PageSettingsService
  ) { }

  ngOnInit() {
    this.subCampaignId = this.campaignId$.subscribe((campaignId) => {
      this.campaignService
        .getCompaniesForSubscription(campaignId)
        .subscribe((result) => {
          if (result) {
            this.companies = result;
          }
        });
      this.subCampaignContainer = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === campaignId
          );
          if (this.campaignContainer) {
            this.changePageSettings();
          }
        }
      );
    });

  }
  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }
  ngOnDestroy() {
    this.subCampaignContainer.unsubscribe();
    this.subCampaignId.unsubscribe();
  }
}

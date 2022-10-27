import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit, OnDestroy {
  campaign?: Campaign;
  subCampaignId: Subscription;
  subCampaignContainer: Subscription;
  campaignContainer: PlayerCampaign;
  detailFaq: CampaignDetail;
  language: any;
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private pageSettingsService: PageSettingsService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.language = this.userService.getLanguage();
    this.subCampaignId = this.campaignId$.subscribe((campaignId) => {
      this.subCampaignContainer = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === campaignId
          );
          if (this.campaignContainer) {
            this.detailFaq = this.campaignContainer?.campaign?.details[this.language]?.filter((detail) => detail.type === 'faq')[0];

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

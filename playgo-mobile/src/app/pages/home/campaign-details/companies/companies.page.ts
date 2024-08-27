import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CompanyModalPage } from 'src/app/core/shared/campaigns/app-company-label/company-modal/company.modal';
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
  userCompany: any;
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private pageSettingsService: PageSettingsService,
    private modalController: ModalController
  ) { }

  async initMyCompany() {
    try {
      this.userCompany = await this.campaignService
        .getCompanyOfTheUser(this.campaignContainer);
      this.companies = this.companies.filter((company: any) => company.id != this.userCompany?.company?.id)
    } catch (error) {
      console.error(error);
    }
  }
  ngOnInit() {
    // this.initCompanies();

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
            this.initMyCompany();
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

  }
  ionViewDidLeave() {
    this.subCampaignContainer.unsubscribe();
    this.subCampaignId.unsubscribe();
  }
  async openCompanyDetail(event: any) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: CompanyModalPage,
      componentProps: {
        userCompany: this.userCompany,
      },
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit {
  id: string;
  campaign?: Campaign;
  imagePath: SafeResourceUrl;
  titlePage = '';
  colorCampaign = null;
  @ViewChild('ionContent') ionContent: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.campaignService.getCampaignDetailsById(this.id).subscribe((result) => {
      this.campaign = result;
      this.titlePage = this.campaign.name;
      this.colorCampaign = this.campaign.type;
      this.imagePath = this.campaign.logo.url ? this.campaign.logo.url :
        'data:image/jpg;base64,' + this.campaign.logo.image;
    });
  }
  getCampaign() {
    return JSON.stringify(this.campaign);
  }
  isPersonal() {
    return this.campaign.type === 'personal';
  }
  campaignHasPrizes() {
    switch (this.campaign.type) {
      case 'personal':
        return false;
      case 'school':
        return true;
      case 'company':
        return true;
      case 'city':
        return true;
      default:
        return true;
    }
  }
  unsubscribeCampaign() {
    this.campaignService
      .unsubscribeCampaign(this.campaign.campaignId)
      .subscribe((result) => {
        this.alertService.showToast(
          this.translateService.instant('campaign.unregistered')
        );
      });
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit {
  id: string;
  campaignContainer?: PlayerCampaign;
  imagePath: SafeResourceUrl;
  titlePage = '';
  colorCampaign = null;
  @ViewChild('ionContent') ionContent: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private userService: UserService,
    private navCtrl: NavController
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.campaignService.myCampaigns$.subscribe((campaigns) => {
      this.campaignContainer = campaigns.find(
        (campaignContainer) => campaignContainer.campaign.campaignId === this.id
      );
      this.titlePage =
        this.campaignContainer.campaign.name[this.userService.getLanguage()];
      this.colorCampaign = this.campaignContainer.campaign.type;
      this.imagePath = this.campaignContainer.campaign.logo.url
        ? this.campaignContainer.campaign.logo.url
        : 'data:image/jpg;base64,' + this.campaignContainer.campaign.logo.image;
    });
  }
  getCampaign() {
    return JSON.stringify(this.campaignContainer.campaign);
  }
  isPersonal() {
    return this.campaignContainer.campaign.type === 'personal';
  }
  campaignHas(what) {
    return this.campaignService.getFunctionalityByType(
      what,
      this.campaignContainer.campaign.type
    ).present;
  }
  unsubscribeCampaign() {
    this.campaignService
      .unsubscribeCampaign(this.campaignContainer.campaign.campaignId)
      .subscribe((result) => {
        this.alertService.showToast({
          messageTranslateKey: 'campaigns.unregistered',
        });
      });
  }
  back() {
    this.navCtrl.back();
  }
}

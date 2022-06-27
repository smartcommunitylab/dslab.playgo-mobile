import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { JoinCityModalPage } from './join-city/join-city.modal';
import { JoinCompanyModalPage } from './join-company/join-company.modal';
import { JoinSchoolModalPage } from './join-school/join-school.modal';

@Component({
  selector: 'app-campaign-join',
  templateUrl: './campaign-join.page.html',
  styleUrls: ['./campaign-join.page.scss'],
})
export class CampaignJoinPage implements OnInit, OnDestroy {
  id: string;
  campaign?: Campaign;
  imagePath: SafeResourceUrl;
  sub: Subscription;
  language: string;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private userService: UserService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.language = this.userService.getLanguage();
    this.sub = this.campaignService
      .getCampaignDetailsById(this.id)
      .subscribe((result) => {
        if (result) {
          this.campaign = result;
          this.imagePath = this.campaign.logo.url
            ? this.campaign.logo.url
            : 'data:image/jpg;base64,' + this.campaign.logo.image;
        }
      });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  //based on the type, change interaction
  joinCampaign(campaign: Campaign) {
    switch (campaign.type) {
      case 'city':
        this.registerToCity(campaign);
        break;
      case 'school':
        this.openRegisterSchool(campaign);
        break;
      case 'company':
        this.openRegisterCompany(campaign);
        break;
      default:
        break;
    }
  }
  async openRegisterSchool(campaign: Campaign) {
    const modal = await this.modalController.create({
      component: JoinSchoolModalPage,
      componentProps: {
        campaign,
        language: this.language,
      },
      cssClass: 'modalConfirm',
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.back();
    }
  }
  async openRegisterCompany(campaign: Campaign) {
    const modal = await this.modalController.create({
      component: JoinCompanyModalPage,
      componentProps: {
        campaign,
        language: this.language,
      },
      cssClass: 'modalConfirm',
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      //update list of campaign
      this.back();
    }
  }

  // registerToCompany(campaign: any, data: any) {
  //   this.sub = this.campaignService
  //     .subscribeToCampaign(campaign.campaignId, data)
  //     .subscribe((result) => {
  //       if (result) {
  //         this.alertService.showToast(
  //           this.translateService.instant('campaigns.registered')
  //         );
  //       }
  //     });
  // }

  joinIsVisible(campaign: Campaign) {
    let joinable = false;
    switch (campaign.type) {
      case 'city':
        joinable = true;
        break;
      case 'school':
        joinable = false;
        break;
      case 'company':
        joinable = true;
        break;
      default:
        break;
    }
    return joinable;
  }
  async registerToCity(campaign: Campaign) {
    const modal = await this.modalController.create({
      component: JoinCityModalPage,
      componentProps: {
        campaign,
        language: this.language,
      },
      cssClass: 'modalConfirm',
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    //this.registerToCompany(campaign, data);
    if (data) {
      //update list of campaign
      this.back();
    }
    // this.sub = this.campaignService
    //   .subscribeToCampaign(campaign.campaignId)
    //   .subscribe((result) => {
    //     if (result) {
    //       this.alertService.showToast({
    //         messageTranslateKey: 'campaigns.registered',
    //       });
    //     }
    //   });
  }
  back() {
    this.navCtrl.back();
  }
}

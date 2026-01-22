import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  ModalController,
  NavController,
} from '@ionic/angular';
import { DateTime } from 'luxon';
import { combineLatest, Subscription } from 'rxjs';
import { PlayerTeamControllerService } from 'src/app/core/api/generated-hsc/controllers/playerTeamController.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { User, UserService } from 'src/app/core/shared/services/user.service';
import { CompaniesCampaignModalPage } from '../../home/campaign-details/companies-modal/companies.modal';
import { DetailCampaignModalPage } from '../../home/campaign-details/detail-modal/detail.modal';
import { JoinCityModalPage } from './join-city/join-city.modal';
import { JoinCompanyModalPage } from './join-company/join-company.modal';
import { JoinSchoolModalPage } from './join-school/join-school.modal';
import { JoinGroupModalPage } from './join-group/join-group.modal';

@Component({
  selector: 'app-campaign-join',
  templateUrl: './campaign-join.page.html',
  styleUrls: ['./campaign-join.page.scss'],
  standalone: false,

})
export class CampaignJoinPage implements OnInit, OnDestroy {
  id: string;
  campaign?: Campaign;
  imagePath: SafeResourceUrl;
  bannerPath: string;
  sub: Subscription;
  subSchool: Subscription;
  subProf: Subscription;
  descriptionExpanded = false;
  canSubscribe = false;
  profile: User;
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private userService: UserService,
    private pageSettingsService: PageSettingsService,
    private playerTeamControllerService: PlayerTeamControllerService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    // combineLatest tra profile e campaign per chiamare manageSpecificDetail
    this.sub = combineLatest([
      this.userService.userProfile$,
      this.campaignService
        .getCampaignDetailsById(this.id),
    ]).subscribe(([profile, campaign]) => {
      this.profile = profile;
      if (campaign) {
        this.campaign = campaign;
        this.imagePath = this.safeImageUrl(this.campaign?.logo ?? null);
        this.bannerPath = this.safeImageUrl(this.campaign?.banner ?? null);
              this.changePageSettings();
        this.manageSpecificDetail(this.campaign, this.profile?.nickname);
      }
    }
    );

  }
  manageSpecificDetail(campaign: Campaign, nickname: string) {
    switch (campaign.type) {
      case 'city':
        this.canSubscribe = true;
        break;
      case 'group':
          this.canSubscribe = true;
          break;
      case 'school':
        this.subSchool =
          this.playerTeamControllerService.checkSubscribeTeamMemberUsingGET({ initiativeId: this.id, nickname }).subscribe(res =>
            this.canSubscribe = res
          );
        break;
      case 'company':
        this.canSubscribe = true;
        break;
      default:
        break;
    }

  }

  ionViewWillEnter() {
    this.changePageSettings();
  }
  clickDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }
  ngOnDestroy(): void {
  }
  ionViewDidLeave() {
    this.sub?.unsubscribe();
    this.subSchool?.unsubscribe();
  }
  private changePageSettings() {
    const language = this.userService.getLanguage();
    this.pageSettingsService.set({
      color: this.campaign?.type,
      // FIXME: ! title is already translated!
      title: this.campaign?.name[language] as any,
    });
  }

  //based on the type, change interaction
  joinCampaign(campaign: Campaign) {
    if (!this.campaignNotStarted(campaign)) {
      switch (campaign.type) {
        case 'city':
          this.registerToCity(campaign);
          break;
        case 'group':
            this.registerToGroup(campaign);
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
    } else {
      this.alertService.showToast({ messageString: 'campaigns.novaliddate' });
    }
  }

  async openRegisterSchool(campaign: Campaign) {
    const language = this.userService.getLanguage();
    const modal = await this.modalController.create({
      component: JoinSchoolModalPage,
      componentProps: {
        campaign,
        language,
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
  }
  async openRegisterCompany(campaign: Campaign) {
    const language = this.userService.getLanguage();
    const modal = await this.modalController.create({
      component: JoinCompanyModalPage,
      componentProps: {
        campaign,
        language,
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      //update list of campaign
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
  }
  getCampaignSponsor(details?: CampaignDetail[] | null): CampaignDetail | null {
    try {
      if (!Array.isArray(details) || details.length === 0) return null;
      const sponsor = details.find((detail) => !!detail && detail.type === 'sponsor');
      return sponsor ?? null;
    } catch (err) {
      console.error('getCampaignSponsor error', err);
      return null;
    }
  }
  campaignHasSponsor(details?: CampaignDetail[] | null): boolean {
    try {
      if (!Array.isArray(details) || details.length === 0) return false;
      return details.some((detail) => !!detail && detail.type === 'sponsor');
    } catch (err) {
      console.error('campaignHasSponsor error', err);
      return false;
    }
  }
  private safeImageUrl(img?: { url?: string; image?: string } | null): string {
    try {
      if (!img) return '';
      if (typeof img.url === 'string' && img.url.trim() !== '') return img.url;
      if (typeof img.image === 'string' && img.image.trim() !== '') return 'data:image/jpg;base64,' + img.image;
      return '';
    } catch (e) {
      console.warn('safeImageUrl error', e);
      return '';
    }
  }

  isCompany(): boolean {
    return !!this.campaign && this.campaign.type === 'company';
  }
  isGroup(): boolean {
    return !!this.campaign && this.campaign.type === 'group';
  }
  isSchool(): boolean {
    return !!this.campaign && this.campaign.type === 'school';
  }

  async openCompanies() {
    const modal = await this.modalController.create({
      component: CompaniesCampaignModalPage,
      cssClass: 'modalConfirm',
      componentProps: {
        campaign: this.campaign,
      },
    });
    await modal.present();
    await modal.onWillDismiss();
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
  campaignNotStarted(campaign: Campaign) {
    // compare campaign.dateFrom and dateTo with now
    const now = DateTime.utc().toMillis();
    if (now > campaign.dateFrom && now < campaign.dateTo) {
      return false;
    }
    return true;
  }
  joinIsVisible(campaign: Campaign) {
    let joinable = false;
    switch (campaign.type) {
      case 'city':
        joinable = true;
        break;
      case 'group':
          joinable = true;
          break;
      case 'school':
        joinable = true;
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
    const language = this.userService.getLanguage();
    const modal = await this.modalController.create({
      component: JoinCityModalPage,
      componentProps: {
        campaign,
        language,
        profile: this.profile
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
  }
  async registerToGroup(campaign: Campaign) {
    const language = this.userService.getLanguage();
    const modal = await this.modalController.create({
      component: JoinGroupModalPage,
      componentProps: {
        campaign,
        language,
        profile: this.profile
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.navCtrl.navigateRoot('/pages/tabs/home');
    }
  }
  back() {
    this.navCtrl.back();
  }

  async openDetail(detail: CampaignDetail) {
    const modal = await this.modalController.create({
      component: DetailCampaignModalPage,
      cssClass: 'modalInfo',
      componentProps: {
        detail,
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}

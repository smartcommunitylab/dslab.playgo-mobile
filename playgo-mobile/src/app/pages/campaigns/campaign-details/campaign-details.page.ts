import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DetailCampaignModalPage } from './detail-modal/detail.modal';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
import { Notification } from '../../../core/api/generated/model/notification';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit, OnDestroy {
  id: string;
  campaignContainer?: PlayerCampaign;
  imagePath: SafeResourceUrl;
  titlePage = '';
  colorCampaign: Campaign.TypeEnum = null;
  language: string;
  subNotification: Subscription;
  subCampaign: Subscription;
  unreadNotifications: Notification[] = [];
  @ViewChild('ionContent') ionContent: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private userService: UserService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private notificationService: NotificationService,
    private pageSettingsService: PageSettingsService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }
  ngOnDestroy(): void {
    this.subNotification.unsubscribe();
    this.subCampaign.unsubscribe();
  }

  ngOnInit() {
    this.language = this.userService.getLanguage();
    this.subNotification = this.notificationService
      .getUnreadCampaignNotifications(this.id)
      .subscribe((notifications) => {
        this.unreadNotifications = notifications;
      });
    this.subCampaign = this.campaignService.myCampaigns$.subscribe(
      (campaigns) => {
        this.campaignContainer = campaigns.find(
          (campaignContainer) =>
            campaignContainer.campaign.campaignId === this.id
        );
        this.titlePage = this.campaignContainer?.campaign?.name[this.language];
        this.colorCampaign = this.campaignContainer?.campaign?.type;
        this.imagePath = this.campaignContainer?.campaign?.logo.url
          ? this.campaignContainer?.campaign?.logo.url
          : 'data:image/jpg;base64,' +
            this.campaignContainer?.campaign?.logo.image;
        this.pageSettingsService.set({
          color: this.colorCampaign,
          // FIXME: ! title is already translated!
          title: this.titlePage as any,
        });
      }
    );
  }
  async openDetail(detail: CampaignDetail) {
    const modal = await this.modalController.create({
      component: DetailCampaignModalPage,
      cssClass: 'modalConfirm',
      componentProps: {
        detail,
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
  getCampaign() {
    return JSON.stringify(this.campaignContainer.campaign);
  }
  isPersonal() {
    return this.campaignContainer.campaign.type === 'personal';
  }
  getLeaderboardLink(): [string] {
    const isSchool = this.campaignContainer.campaign.type === 'school';
    const page = isSchool ? 'school-leaderboard' : 'leaderboard';
    const campaignId = this.campaignContainer.campaign.campaignId;

    return [`/pages/tabs/campaigns/${page}/${campaignId}`];
  }
  campaignHas(what: string): boolean {
    return (
      this.campaignService.getFunctionalityByType(
        what,
        this.campaignContainer.campaign.type
      )?.present || false
    );
  }
  unsubscribeCampaign() {
    this.campaignService
      .unsubscribeCampaign(this.campaignContainer.campaign.campaignId)
      .subscribe((result) => {
        this.alertService.showToast({
          messageTranslateKey: 'campaigns.unregistered',
        });
        this.navCtrl.back();
      });
  }

  back() {
    this.navCtrl.back();
  }
}

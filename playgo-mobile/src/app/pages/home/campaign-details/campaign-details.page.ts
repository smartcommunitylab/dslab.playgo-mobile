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
import {
  filter,
  first,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
import { Notification } from '../../../core/api/generated/model/notification';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { UnsubscribeModalPage } from './unsubscribe-modal/unsubscribe.modal';
import { throwIfNil } from 'src/app/core/shared/rxjs.utils';
import { environment } from 'src/environments/environment';
import {
  ErrorService,
  UserError,
} from 'src/app/core/shared/services/error.service';
import { CompaniesCampaignModalPage } from './companies-modal/companies.modal';

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
  isDestroyed$ = new Subject<void>();
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
    private pageSettingsService: PageSettingsService,
    private errorService: ErrorService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.complete();
  }

  ngOnInit() {
    this.language = this.userService.getLanguage();
    this.notificationService
      .getUnreadCampaignNotifications(this.id)
      .pipe(takeUntil(this.isDestroyed$))
      .subscribe((notifications) => {
        this.unreadNotifications = notifications;
      });
    this.campaignService.myCampaigns$
      .pipe(
        takeUntil(this.isDestroyed$),
        switchMap((campaigns) => {
          const campaignContainer = campaigns.find(
            (eachCampaignContainer) =>
              eachCampaignContainer.campaign.campaignId === this.id
          );
          if (campaignContainer) {
            return of(campaignContainer);
          } else {
            return this.campaignService.getCampaignDetailsById(this.id).pipe(
              throwIfNil(
                () =>
                  new UserError({
                    id: 'campaign-not-found',
                    message: 'campaigns.detail.not_found',
                  })
              ),
              map((campaign) => ({
                campaign,
                player: null,
              })),
              this.errorService.getErrorHandler('normal')
            );
          }
        })
      )
      .subscribe((campaignContainer) => {
        this.campaignContainer = campaignContainer;
        this.titlePage = this.campaignContainer?.campaign?.name[this.language];
        this.colorCampaign = this.campaignContainer?.campaign?.type;
        this.imagePath = this.campaignContainer?.campaign?.logo.url
          ? this.campaignContainer?.campaign?.logo.url
          : 'data:image/jpg;base64,' +
            this.campaignContainer?.campaign?.logo.image;
        this.changePageSettings();
      });
  }

  ionViewWillEnter() {
    this.changePageSettings();
  }

  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.colorCampaign,
      // FIXME: ! title is already translated!
      title: this.titlePage as any,
    });
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
  async openCompanies() {
    const modal = await this.modalController.create({
      component: CompaniesCampaignModalPage,
      cssClass: 'modalConfirm',
      componentProps: {
        campaign: this.campaignContainer.campaign,
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
  getCampaignSponsor(details: CampaignDetail[]): Record<string, unknown> {
    return details.filter((detail) => detail.type === 'sponsor')[0];
  }
  campaignHasSponsor(details: CampaignDetail[]): any {
    return details.filter((detail) => detail.type === 'sponsor').length > 0;
  }

  getCampaign() {
    return JSON.stringify(this.campaignContainer.campaign);
  }
  isPersonal() {
    return this.campaignContainer.campaign.type === 'personal';
  }
  isCompany() {
    return this.campaignContainer.campaign.type === 'company';
  }
  getLeaderboardLink(): [string] {
    const isSchool = this.campaignContainer.campaign.type === 'school';
    const page = isSchool ? 'school-leaderboard' : 'leaderboard';
    const campaignId = this.campaignContainer.campaign.campaignId;

    return [`/pages/tabs/home/details/${campaignId}/${page}`];
  }
  campaignHas(what: string): boolean {
    return (
      this.campaignService.getFunctionalityByType(
        what,
        this.campaignContainer.campaign.type
      )?.present || false
    );
  }
  async unsubscribeCampaign() {
    const modal = await this.modalController.create({
      component: UnsubscribeModalPage,
      cssClass: 'modal-challenge',
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.campaignService
        .unsubscribeCampaign(this.campaignContainer.campaign.campaignId)
        .subscribe((result) => {
          this.alertService.showToast({
            messageTranslateKey: 'campaigns.unregistered',
          });
          this.navCtrl.back();
        });
    }
  }

  back() {
    this.navCtrl.back();
  }
  openSupport() {
    window.open('mailto:' + environment.support.email);
  }
}

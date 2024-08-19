import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { User, UserService } from 'src/app/core/shared/services/user.service';
import { DetailCampaignModalPage } from './detail-modal/detail.modal';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  first,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
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
import { TeamService } from 'src/app/core/shared/services/team.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { find } from 'lodash-es';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit, OnDestroy, AfterViewChecked {

  id: string;
  campaignContainer?: PlayerCampaign;
  imagePath: SafeResourceUrl;
  titlePage = '';
  colorCampaign: Campaign.TypeEnum = null;
  language: string;
  isDestroyed$ = new Subject<void>();
  unreadNotifications: Notification[] = [];
  @ViewChild('ionContent') ionContent: ElementRef;
  @ViewChild('descText') descText: ElementRef;

  descriptionExpanded = false;
  subStat: Subscription;
  subTeam: Subscription;
  profile: User;
  team: PlayerTeam;
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  playerCampaign$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.myCampaigns$.pipe(
        map((campaigns) => find(campaigns, (playercampaign) => playercampaign.subscription.campaignId === campaignId)),
        tap((campaigns) => console.log(campaigns)),
        // throwIfNil(() => new Error('Campaign not found')),
        this.errorService.getErrorHandler()
      )
    ),
    tap(campaign => console.log('playercampaign' + campaign)),
    shareReplay(1)
  );

  teamId$: Observable<string> = this.playerCampaign$.pipe(
    map(campaign => {
      console.log(campaign);
      return (campaign as PlayerCampaign)?.subscription?.campaignData?.teamId;
    }),
    tap((team: string) => console.log(team)),
    shareReplay(1)
  );
  myCampaignSub: Subscription;
  unsubSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private userService: UserService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private notificationService: NotificationService,
    private pageSettingsService: PageSettingsService,
    private errorService: ErrorService,
    private teamService: TeamService
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.complete();

  }
  ionViewDidLeave() {
    this.subStat?.unsubscribe();
    this.myCampaignSub?.unsubscribe();
  }
  ngAfterViewChecked() {
    if (this.descText?.nativeElement) {
      console.log(this.descText.nativeElement.offsetHeight < this.descText.nativeElement.scrollHeight ||
        this.descText.nativeElement.offsetWidth < this.descText.nativeElement.scrollWidth);
      return (this.descText.nativeElement.offsetHeight < this.descText.nativeElement.scrollHeight ||
        this.descText.nativeElement.offsetWidth < this.descText.nativeElement.scrollWidth);
    }
    return false;
  }
  ngOnInit() {
    this.subTeam = combineLatest([
      this.campaignId$,
      this.teamId$,
    ]).pipe(
      switchMap(([campaignId, teamId]) => teamId ? this.teamService.getMyTeam(
        campaignId,
        teamId
      ) : EMPTY),
      this.errorService.getErrorHandler()).subscribe(team => this.team = team);
    this.subStat = this.userService.userProfile$
      .subscribe((profile) => {
        this.profile = profile;
      });
    this.language = this.userService.getLanguage();
    this.notificationService
      .getUnreadCampaignNotifications(this.id)
      .pipe(takeUntil(this.isDestroyed$))
      .subscribe((notifications) => {
        this.unreadNotifications = notifications;
      });
    this.myCampaignSub = this.campaignService.myCampaigns$
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
      cssClass: 'modalInfo',
      componentProps: {
        detail,
        type: this.campaignContainer?.campaign?.type
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
  getCampaignFAQ(details: CampaignDetail[]): Record<string, unknown> {
    return details.filter((detail) => detail.type === 'faq')[0];
  }
  campaignHasFAQ(details: CampaignDetail[]): any {
    return details.filter((detail) => detail.type === 'faq').length > 0;
  }
  clickDescription() {
    if (this.isTextOverflow('descText') || this.descriptionExpanded) {
      this.descriptionExpanded = !this.descriptionExpanded;
    }

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
  isSchool() {
    return this.campaignContainer.campaign.type === 'school';
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
      )?.present || false || (what === 'leaderboard' && this.campaignHasPlacement(this.campaignContainer.campaign))
    );
  }
  campaignHasPlacement(campaign: Campaign): boolean {
    return (campaign.type === 'company' && campaign.campaignPlacement?.active);
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
      this.unsubSub = this.campaignService
        .unsubscribeCampaign(this.campaignContainer.campaign.campaignId)
        .subscribe((result) => {
          this.alertService.showToast({
            messageTranslateKey: 'campaigns.unregistered',
          });
          this.subStat?.unsubscribe();
          this.myCampaignSub?.unsubscribe();
          this.navCtrl.navigateRoot('/pages/tabs/home');
        });
    }
  }

  back() {
    this.navCtrl.back();
  }
  isTextOverflow(elementId: string): boolean {
    const elem = document.getElementById(elementId);
    if (elem) {
      return (elem.offsetHeight < elem.scrollHeight);
    }
    else {
      return false;
    }
  }
  openSupport() {
    window.open('mailto:' + environment.support.email +
      '?subject=Play%26go%20' + this.campaignContainer?.campaign?.name.it +
      '%20Supporto&body=-----------NON CANCELLARE-----------%0D%0A%0D%0A' +
      'territoryId: ' + this.profile.territoryId +
      '%0D%0Acampagna: ' + this.campaignContainer?.campaign?.campaignId +
      (this.campaignContainer?.campaign?.type === 'school' ?
        ('%0D%0Ateam: ' + this.team?.customData?.name) : '') +
      '%0D%0AplayerId: ' + this.profile.playerId +
      '%0D%0A%0D%0A-----SCRIVI IL TUO MESSAGGIO QUI SOTTO----');
    // territorio, campagna, nome squadra, ID utente (Oggetto: "Play&go <nome campagna> Supporto"
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
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
import { AuthFlowService } from 'src/app/core/shared/services/auth-flow.service';
import { JwtHelperService } from 'src/app/core/shared/services/jwt-helper.service';
import { TranslateService } from '@ngx-translate/core';

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
  AAC_BASE_URL: string = 'https://aac.platform.smartcommunitylab.it';
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private userService: UserService,
    private pageSettingsService: PageSettingsService,
    private playerTeamControllerService: PlayerTeamControllerService,
    private authFlowService: AuthFlowService,
    private jwtHelper: JwtHelperService,
    private platform: Platform,
    private translate: TranslateService

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
        this.checkPendingAuthCallback();

      }
    }
    );

  }
  /**
 * Controlla se c'è un auth callback in attesa di essere completato
 */
  private async checkPendingAuthCallback() {
    const pendingCampaignId = sessionStorage.getItem('pending_campaign_id');
    const tempToken = sessionStorage.getItem('temp_auth_token');

    if (pendingCampaignId === this.campaign.campaignId && tempToken) {
      console.log('=== Completing pending auth callback ===');

      // Rimuovi subito per evitare loop
      sessionStorage.removeItem('pending_campaign_id');
      sessionStorage.removeItem('temp_auth_token');

      // Nascondi eventuali loading
      await this.alertService.dismissLoading();

      // Processa il token
      await this.handleTokenValidationAndJoin(this.campaign, tempToken);
    }
  }

  async registerToGroup(campaign: Campaign) {
    const specificData = campaign?.specificData;

    if (specificData?.clientId) {
      try {
        // Salva l'ID della campagna per dopo il callback
        sessionStorage.setItem('pending_campaign_id', campaign.campaignId);

        await this.alertService.showLoading(this.translate.instant('campaigns.joinMessage.loading.authenticating')
        );

        console.log('Starting temp auth flow');

        // Avvia auth temporaneo - questo farà redirect/aprirà browser
        const tempToken = await this.authFlowService.startAuthForCampaign({
          clientId: specificData.clientId,
          scopes: specificData.oauth_scope || 'openid email',
          authUrl: specificData.authUrl || this.AAC_BASE_URL
        });

        console.log('Token received:', tempToken ? 'YES' : 'NO');

        await this.alertService.dismissLoading();

        if (!tempToken) {
          sessionStorage.removeItem('pending_campaign_id');
          throw new Error('No token received');
        }

        // Salva il token e ricarica la pagina (su web)
        // Su mobile il token viene gestito direttamente
        const isNative = this.platform.is('capacitor') || this.platform.is('hybrid');

        if (!isNative) {
          // Su web: salva token e attendi che la pagina si ricarichi
          sessionStorage.setItem('temp_auth_token', tempToken);
          console.log('Token saved, page will reload and process it');
          // La pagina si ricaricherà dopo il redirect OAuth
          // e checkPendingAuthCallback() processerà il token
        } else {
          // Su mobile: processa immediatamente (no page reload)
          await this.handleTokenValidationAndJoin(campaign, tempToken);
        }

      } catch (error) {
        await this.alertService.dismissLoading();
        console.error('Auth flow failed:', error);

        sessionStorage.removeItem('pending_campaign_id');
        sessionStorage.removeItem('temp_auth_token');

        await this.alertService.showToast({
          messageString: this.translate.instant('campaigns.joinMessage.error.joinFailed')
        });
      }
    } else {
      // Fallback: apri modal senza token
      await this.openJoinModalWithoutToken(campaign);
    }
  }

  /**
   * Valida il JWT e gestisce la join in base ai claim
   */
  private async handleTokenValidationAndJoin(campaign: Campaign, token: string): Promise<void> {
    const specificData = campaign.specificData;

    console.log('=== Token Validation START ===');
    console.log('ClaimName:', specificData.claimName);

    // Decodifica il token
    const payload = this.jwtHelper.decodeToken(token);
    console.log('Decoded payload:', payload);

    if (!payload) {
      await this.alertService.presentAlert({
        headerTranslateKey: 'campaigns.joinMessage.error.title' as any,
        messageTranslateKey: 'campaigns.joinMessage.error.invalidToken' as any

      });
      return;
    }

    // Estrai il claim richiesto
    const claimValue = payload[specificData.claimName];
    console.log(`Claim '${specificData.claimName}' value:`, claimValue);

    if (!claimValue) {
      await this.alertService.presentAlert({
        headerTranslateKey: 'campaigns.joinMessage.error.title' as any,
        messageString: this.translate.instant('campaigns.joinMessage.error.missingClaim', {
          claimName: specificData.claimName
        })
      });
      return;
    }

    // Valida il claim con regex
    const isValid = this.jwtHelper.validateClaimWithRegex(
      claimValue,
      specificData.claimRegExp
    );

    if (!isValid) {
      await this.alertService.presentAlert({
        headerTranslateKey: 'campaigns.joinMessage.error.title' as any,
        messageString: this.translate.instant('campaigns.joinMessage.error.claimMismatch', {
          claimName: specificData.claimName
        })
      });
      return;
    }

    // Parsing dei valori multipli
    const claimValues = this.jwtHelper.parseMultiValueClaim(claimValue);
    console.log('Parsed claim values:', claimValues);

    if (claimValues.length === 0) {
      await this.alertService.presentAlert({
        headerTranslateKey: 'campaigns.joinMessage.error.title' as any,
        messageString: this.translate.instant('campaigns.joinMessage.error.noValidValues', {
          claimName: specificData.claimName
        })
      });
      return;
    }

    // Filtra solo i valori presenti nella groupList
    const validGroups = claimValues.filter(value =>
      specificData.groupList?.some(g => g.value === value)
    );

    console.log('Valid groups:', validGroups);

    if (validGroups.length === 0) {
      await this.alertService.presentAlert({
        headerTranslateKey: 'campaigns.joinMessage.error.title' as any,
        messageTranslateKey: 'campaigns.joinMessage.error.noValidRoles' as any
      });
      return;
    }

    // if (validGroups.length === 1) {
    //   // Un solo gruppo: join automatica SENZA modal
    //   console.log('Single group, auto-joining:', validGroups[0]);

    //   await this.alertService.showLoading(this.translate.instant('campaigns.joinMessage.loading.joining')
    //   );

    //   try {
    //     await this.joinCampaignWithToken(campaign.campaignId, validGroups[0], token);

    //     await this.alertService.dismissLoading();
    //     await this.alertService.showToast({
    //       messageString: this.translate.instant('campaigns.joinMessage.error.joinSuccess')
    //     });

    //     // Naviga alla campagna appena joinata
    //     this.navCtrl.navigateRoot(`/pages/tabs/home`);

    //   } catch (error) {
    //     await this.alertService.dismissLoading();
    //     console.error('Join error:', error);
    //   }
    // } else {
    //   // Più gruppi: mostra modal per selezione
    //   console.log('Multiple groups, opening modal');
      await this.openJoinModalWithGroups(campaign, token, validGroups, specificData.groupList);
    // }
  }

  /**
   * Join diretta con token e groupId
   */
  private async joinCampaignWithToken(
    campaignId: string,
    groupId: string,
    token: string
  ): Promise<void> {
    const body = {
      groupId: groupId,
      extToken: token
    };

    console.log('Joining with:', { campaignId, groupId });

    await this.campaignService.subscribeToCampaign(campaignId, body).toPromise();
  }

  /**
   * Apri modal con selezione gruppi (SOLO se > 1 gruppo valido)
   */
  private async openJoinModalWithGroups(
    campaign: Campaign,
    token: string,
    validGroups: string[],
    groupList: any[]
  ): Promise<void> {
    const language = this.userService.getLanguage();

    const modal = await this.modalController.create({
      component: JoinGroupModalPage,
      componentProps: {
        campaign,
        language,
        authData: {
          access_token: token
        },
        availableGroups: validGroups.map(value => {
          const group = groupList.find(g => g.value === value);
          return {
            value,
            label: group?.label || { en: value, it: value }
          };
        })
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.success) {
      // Naviga alla campagna appena joinata
      this.navCtrl.navigateRoot(`/pages/campaigns/${campaign.campaignId}`);
    }
  }

  /**
   * Apri modal SENZA token (campagne senza OAuth)
   */
  private async openJoinModalWithoutToken(campaign: Campaign): Promise<void> {
    const language = this.userService.getLanguage();

    const modal = await this.modalController.create({
      component: JoinGroupModalPage,
      componentProps: {
        campaign,
        language
      },
      cssClass: 'modalConfirm',
      canDismiss: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.navCtrl.navigateRoot(`/pages/campaigns/${campaign.campaignId}`);
    }
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
  campaignNotStarted(campaign: Campaign): boolean {
    if (!campaign?.dateFrom) return false;
    const now = new Date().getTime();
    const startDate = new Date(campaign.dateFrom).getTime();
    return now < startDate;
  }
  /**
   * Verifica se siamo nel periodo di registrazione
   */
  isRegistrationPeriodActive(campaign: Campaign): boolean {
    if (!campaign) return false;
    
    const now = new Date().getTime();
    
    const registrationFrom = campaign.registrationFrom 
      ? new Date(campaign.registrationFrom).getTime() 
      : null;
      
    const registrationTo = campaign.registrationTo 
      ? new Date(campaign.registrationTo).getTime() 
      : null;

    // Se non ci sono date di registrazione, permetti sempre
    if (!registrationFrom && !registrationTo) return true;
    
    const afterStart = !registrationFrom || now >= registrationFrom;
    const beforeEnd = !registrationTo || now <= registrationTo;
    
    return afterStart && beforeEnd;
  }

  /**
   * Verifica se il periodo di registrazione non è ancora iniziato
   */
  isRegistrationNotStarted(campaign: Campaign): boolean {
    if (!campaign?.registrationFrom) return false;
    const now = new Date().getTime();
    const regFrom = new Date(campaign.registrationFrom).getTime();
    return now < regFrom;
  }

  /**
   * Verifica se il periodo di registrazione è terminato
   */
  isRegistrationEnded(campaign: Campaign): boolean {
    if (!campaign?.registrationTo) return false;
    const now = new Date().getTime();
    const regTo = new Date(campaign.registrationTo).getTime();
    return now > regTo;
  }

  /**
   * Verifica se il button join deve essere disabilitato
   */
  isJoinButtonDisabled(campaign: Campaign): boolean {
    // Disabilita se campagna non ancora iniziata
    if (this.campaignNotStarted(campaign)) return true;
    
    // Disabilita se non può iscriversi (subscriptionOpened)
    if (!this.canSubscribe) return true;
    
    // Disabilita se fuori dal periodo di registrazione
    if (!this.isRegistrationPeriodActive(campaign)) return true;
    
    return false;
  }

  /**
   * Mostra periodo di registrazione nel template
   */
  hasRegistrationPeriod(campaign: Campaign): boolean {
    return !!(campaign?.registrationFrom || campaign?.registrationTo);
  }
  /**
   * Ottiene il testo da mostrare nell'header (date campagna o registrazione)
   */
  getHeaderDateText(campaign: Campaign): string {
    if (!campaign) return '';
    
    
    
    // Altrimenti mostra date campagna
    const from = campaign.dateFrom 
      ? DateTime.fromISO(new Date(campaign.dateFrom).toISOString()).toFormat('dd MMMM y')
      : '';
    const to = campaign.dateTo 
      ? DateTime.fromISO(new Date(campaign.dateTo).toISOString()).toFormat('dd MMMM y')
      : '';
    
    if (from && to) {
      return `${from} - ${to}`;
    } else if (from) {
      return from;
    } else if (to) {
      return to;
    }
    
    return '';
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

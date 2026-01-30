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
import { AuthFlowService } from 'src/app/core/shared/services/auth-flow.service';

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
  AAC_BASE_URL: string= 'https://aac.platform.smartcommunitylab.it';
  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private userService: UserService,
    private pageSettingsService: PageSettingsService,
    private playerTeamControllerService: PlayerTeamControllerService,
   private authFlowService: AuthFlowService

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
    const authSuccess = sessionStorage.getItem('temp_auth_success');

    if (authSuccess) {
      console.log('Returning from OAuth callback, completing join...');
      sessionStorage.removeItem('temp_auth_success');
      
      // Aspetta che la pagina sia completamente caricata
      setTimeout(() => {
        this.completeJoinWithToken();
      }, 500);
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
    const specificData = campaign?.specificData;
  
    if (specificData?.clientId) {
      try {
        // Salva campaignId per il redirect dopo auth
        sessionStorage.setItem('pending_campaign_id', campaign.campaignId);
        sessionStorage.setItem('pending_campaign', JSON.stringify(campaign));
  
        await this.alertService.showLoading('Authenticating...');
  
        console.log('Starting temp auth flow with config:', {
          clientId: specificData.clientId,
          scopes: specificData.oauth_scope || 'openid',
        });
  
        // Avvia auth temporaneo
        const tempToken = await this.authFlowService.startAuthForCampaign({
          clientId: specificData.clientId,
          scopes: specificData.oauth_scope || 'openid',
          authUrl: specificData.authUrl || 'https://aac.platform.smartcommunitylab.it'
        });
  
        console.log('Temporary token received:', tempToken ? 'YES' : 'NO');
  
        await this.alertService.dismissLoading();
  
        if (!tempToken) {
          throw new Error('No token received');
        }
  
        // Su native, apri subito il modal (non c'è redirect)
        await this.openJoinModal(campaign, tempToken);
  
      } catch (error) {
        await this.alertService.dismissLoading();
        console.error('Auth flow failed:', error);
        
        // Pulisci dati salvati
        sessionStorage.removeItem('pending_campaign_id');
        sessionStorage.removeItem('pending_campaign');
        

      }
    } else {
      // Fallback: apri modal senza token
      await this.openJoinModal(campaign, undefined);
    }
  }
  
  /**
   * Completa il join con il token dopo il redirect OAuth
   */
  private async completeJoinWithToken() {
    const pendingCampaignStr = sessionStorage.getItem('pending_campaign');
    
    if (!pendingCampaignStr) {
      console.warn('No pending campaign found');
      return;
    }
  
    const campaign = JSON.parse(pendingCampaignStr) as Campaign;
    
    console.log('Completing join for campaign:', campaign.campaignId);
  
    // Mostra loading mentre aspettiamo il token
    await this.alertService.showLoading('Processing authentication...');
  
    try {
      // Aspetta un attimo che authorizationCallback() processi il code
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Ottieni il token dal servizio
      const tempToken = await this.authFlowService.getTemporaryToken();
  
      await this.alertService.dismissLoading();
  
      if (tempToken) {
        console.log('Token available, opening modal');
        await this.openJoinModal(campaign, tempToken);
      } else {
        console.error('No token available after auth');

      }
    } catch (error) {
      await this.alertService.dismissLoading();
      console.error('Error getting temporary token:', error);
      

    } finally {
      // Pulisci sempre i dati salvati
      sessionStorage.removeItem('pending_campaign');
      sessionStorage.removeItem('pending_campaign_id');
    }
  }
  
  /**
   * Apri il modal di join con o senza token temporaneo
   */
  private async openJoinModal(campaign: Campaign, tempToken?: string) {
    const modal = await this.modalController.create({
      component: JoinGroupModalPage,
      componentProps: {
        campaign,
        temporaryToken: tempToken,
      },
    });
  
    await modal.present();
    const { data } = await modal.onWillDismiss();
  
    // Pulisci il token temporaneo dopo l'uso
    if (tempToken) {
      await this.authFlowService.clearTemporaryAuth();
    }
  
    if (data) {
      // Successo: naviga alla home o ricarica la pagina
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

import { HttpHeaders } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { User, UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.modal.html',
  styleUrls: ['./join-group.modal.scss'],
  standalone: false,

})
export class JoinGroupModalPage implements OnInit {
  @Input() authData?: {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
  }; joinGroupForm: FormGroup;
  campaign: Campaign;
  privacy: any;
  rules: any;
  isSubmitted = false;
  language: string;
  profile: User;

  constructor(
    private modalController: ModalController,
    private alertService: AlertService,
    private errorService: ErrorService,
    private campaignService: CampaignService,
    public formBuilder: FormBuilder,
    private userService: UserService,
    private navCtrl: NavController
  ) { }
  ngOnInit() {
    this.language = this.userService.getLanguage();
    const rules = this.campaign.details[this.language];
    this.rules = rules?.find((detail) => detail.type === 'rules');
    this.privacy = rules?.find((detail) => detail.type === 'privacy');
    this.joinGroupForm = this.formBuilder.group({
      name: [''],
      ...(this.privacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.rules && { rules: [false, Validators.requiredTrue] }),
    });
  }
  //computed errorcontrol
  get errorControl() {
    return this.joinGroupForm.controls;
  }
  close() {
    this.modalController.dismiss(false);
  }
  isAlreadySubscribed() {
    return this.profile?.personalData?.registeredIds?.includes(this.campaign?.campaignId);
  }
  openPrivacyPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.privacyPopup.header' as any,
      messageString: this.privacy.content,
      cssClass: 'modalJoin',
    });
  }

  openRulesPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.rulesPopup.header' as any,
      messageString: this.rules.content,
      cssClass: 'modalJoin',
    });
  }
  openCodeInfoPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.codeInfo.header' as any,
      messageString: 'campaigns.joinmodal.codeInfo.message' as any,
      cssClass: 'modalConfirm',
    });
  }
  async joinGroupSubmit() {
    try {
      this.isSubmitted = true;
  
      // Prepara headers HTTP
      let headers = new HttpHeaders();
      
      // Se abbiamo authData, aggiungi il token temporaneo
      if (this.authData?.access_token) {
        headers = headers.set('Authorization', `Bearer ${this.authData.access_token}`);
      }
  
  

     await this.campaignService.subscribeToCampaign(
      this.campaign.campaignId,
      this.joinGroupForm.value
    ).toPromise();
  
      // Successo
      this.alertService.showToast({
        messageString: 'Successfully joined campaign!',
      });
  
      this.modalController.dismiss({ success: true });
  
    } catch (error) {
      console.error('Join campaign error:', error);
      this.errorService.handleError(error);
      this.isSubmitted = false;
    }
}
}

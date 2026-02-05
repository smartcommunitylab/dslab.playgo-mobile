import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
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
  @Input() campaign: Campaign;
  @Input() language: string;
  @Input() profile: User;
  
  // Nuovi input per OAuth flow
  @Input() authData?: {
    access_token?: string;
  };
  @Input() availableGroups?: Array<{
    value: string;
    label: { it: string; en: string };
  }>;

  joinGroupForm: FormGroup;
  privacy: any;
  rules: any;
  isSubmitted = false;

  constructor(
    private modalController: ModalController,
    private alertService: AlertService,
    private campaignService: CampaignService,
    public formBuilder: FormBuilder,
    private userService: UserService,
    private navCtrl: NavController,
        private errorService: ErrorService,
    
  ) {}

  ngOnInit() {
    this.language = this.language || this.userService.getLanguage();
    const rules = this.campaign.details?.[this.language];
    this.rules = rules?.find((detail) => detail.type === 'rules');
    this.privacy = rules?.find((detail) => detail.type === 'privacy');
    
    // Build form con groupId SOLO se ci sono gruppi disponibili
    this.joinGroupForm = this.formBuilder.group({
      // name: [''],
      ...(this.availableGroups && this.availableGroups.length > 0 && {
        groupId: ['', Validators.required]
      }),
      ...(this.privacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.rules && { rules: [false, Validators.requiredTrue] }),
    });

    console.log('Join modal initialized:', {
      hasAuthData: !!this.authData,
      hasGroups: !!this.availableGroups,
      groupCount: this.availableGroups?.length || 0
    });
  }

  get errorControl() {
    return this.joinGroupForm.controls;
  }

  close() {
    this.modalController.dismiss({ success: false });
  }

  isAlreadySubscribed() {
    return this.profile?.personalData?.registeredIds?.includes(this.campaign?.campaignId);
  }

  getGroupLabel(group: any): string {
    return group.label[this.language] || group.label.en || group.value;
  }

  openPrivacyPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.privacyPopup.header' as any,
      messageString: this.privacy.content,
    });
  }

  openRulesPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.rulesPopup.header' as any,
      messageString: this.rules.content,
    });
  }

  async joinGroupSubmit() {
    try {
      this.isSubmitted = true;

      if (!this.joinGroupForm.valid) {
        console.log('Form invalid:', this.joinGroupForm.errors);
        return;
      }

      const formValue = this.joinGroupForm.value;
      const body: any = {};

      // Se abbiamo gruppi disponibili, aggiungi groupId e token
      if (this.availableGroups && this.availableGroups.length > 0) {
        if (!formValue.groupId) {
          throw new Error('Please select a group');
        }
        
        body.groupId = formValue.groupId;
        
        if (this.authData?.access_token) {
          body.extToken = this.authData.access_token;
        }
      }

      // // Aggiungi name se presente
      // if (formValue.name) {
      //   body.name = formValue.name;
      // }

      console.log('Submitting join with body:', {
        campaignId: this.campaign.campaignId,
        hasGroupId: !!body.groupId,
        hasToken: !!body.extToken,
        // hasName: !!body.name
      });

      await this.campaignService.subscribeToCampaign(
        this.campaign.campaignId,
        body
      ).toPromise();

      this.alertService.showToast({
        messageTranslateKey: 'campaigns.registered',
      });

      this.modalController.dismiss({ success: true });
      this.navCtrl.navigateRoot('/pages/tabs/home');


    } catch (error) {
      console.error('Join campaign error:', error);
      this.errorService.handleError(error);

      this.isSubmitted = false;
    }
  }
}
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
  
  // Stato per la schermata di conferma
  showConfirmation = false;
  selectedGroupInfo: any = null;
  groupConfirmed = false; // Flag per sapere se gruppo è stato confermato
  
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
    
    const initialGroupId = this.availableGroups?.length === 1 
      ? this.availableGroups[0].value 
      : '';
    
    this.joinGroupForm = this.formBuilder.group({
      ...(this.availableGroups && this.availableGroups.length > 0 && {
        groupId: [initialGroupId, Validators.required]
      }),
      ...(this.privacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.rules && { rules: [false, Validators.requiredTrue] }),
    });

    // Se c'è un solo gruppo, consideralo già confermato
    if (this.availableGroups?.length === 1) {
      this.groupConfirmed = true;
      this.selectedGroupInfo = this.availableGroups[0];
    }

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
    if (!group) return '';
    return group.label?.[this.language] || group.label?.en || group.value || '';
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

  /**
   * Chiamato quando utente seleziona un gruppo dalla dropdown
   * NON mostra ancora la conferma, aspetta il submit
   */
  onGroupSelected() {
    const groupId = this.joinGroupForm.get('groupId')?.value;
    
    if (!groupId || !this.availableGroups || this.availableGroups.length <= 1) {
      return;
    }

    const selectedGroup = this.availableGroups.find(g => g.value === groupId);
    
    if (selectedGroup) {
      this.selectedGroupInfo = selectedGroup;
      // Reset conferma se utente cambia gruppo
      this.groupConfirmed = false;
    }
  }

  /**
   * Torna indietro dalla schermata di conferma
   */
  goBackToSelection() {
    this.showConfirmation = false;
    this.groupConfirmed = false;
    this.isSubmitted = false; // Reset validation errors
  }

  /**
   * Conferma il gruppo selezionato e procedi con submit
   */
  async confirmGroupSelection() {
    this.groupConfirmed = true;
    this.showConfirmation = false;
    
    // Ora procedi con il submit effettivo
    await this.performSubmit();
  }

  /**
   * Submit del form - controlla se serve conferma gruppo
   */
  async joinGroupSubmit() {
    try {
      this.isSubmitted = true;

      // Validazione form
      if (!this.joinGroupForm.valid) {
        console.log('Form invalid:', this.joinGroupForm.errors);
        return;
      }

      const formValue = this.joinGroupForm.value;

      // Se ci sono multipli gruppi e NON è ancora stato confermato, mostra conferma
      if (this.availableGroups && 
          this.availableGroups.length > 1 && 
          !this.groupConfirmed) {
        
        const groupId = formValue.groupId;
        const selectedGroup = this.availableGroups.find(g => g.value === groupId);
        
        if (!selectedGroup) {
          console.error('No group selected');
          return;
        }

        // Mostra schermata di conferma
        this.selectedGroupInfo = selectedGroup;
        this.showConfirmation = true;
        return; // Stop qui, aspetta conferma
      }

      // Se siamo qui, o c'è un solo gruppo o è già stato confermato
      await this.performSubmit();

    } catch (error) {
      console.error('Join campaign error:', error);
      this.errorService.handleError(error);
      this.isSubmitted = false;
      this.groupConfirmed = false;
    }
  }

  /**
   * Esegue il submit effettivo della subscription
   */
  private async performSubmit() {
    try {
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

      console.log('Submitting join with body:', {
        campaignId: this.campaign.campaignId,
        hasGroupId: !!body.groupId,
        hasToken: !!body.extToken,
        groupConfirmed: this.groupConfirmed
      });

      // Chiamata API
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
      console.error('Submit error:', error);
      this.errorService.handleError(error);
      this.isSubmitted = false;
      this.groupConfirmed = false;
      throw error;
    }
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { User, UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-join-city',
  templateUrl: './join-city.modal.html',
  styleUrls: ['./join-city.modal.scss'],
})
export class JoinCityModalPage implements OnInit {
  joinCityForm: FormGroup;
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
    this.joinCityForm = this.formBuilder.group({
      name: [''],
      ...(this.privacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.rules && { rules: [false, Validators.requiredTrue] }),
    });
  }
  //computed errorcontrol
  get errorControl() {
    return this.joinCityForm.controls;
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
  joinCitySubmit() {
    // call join with all params
    this.isSubmitted = true;
    if (!this.joinCityForm.valid) {
      return false;
    } else {
      const body = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        nick_recommandation: this.joinCityForm.value.name
      };
      this.campaignService
        .subscribeToCampaign(this.campaign.campaignId, body)
        .subscribe(
          (result) => {
            if (result) {
              this.alertService.showToast({
                messageTranslateKey: 'campaigns.registered',
              });
              this.modalController.dismiss(true);
            }
          },
          (err) => {
            this.errorService.handleError(err);
          }
        );
    }
  }
}

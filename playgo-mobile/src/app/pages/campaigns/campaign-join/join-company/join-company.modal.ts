import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CompanyDetails } from 'src/app/core/shared/campaigns/classes/company-details';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-join-company',
  templateUrl: './join-company.modal.html',
  styleUrls: ['./join-company.modal.scss'],
})
export class JoinCompanyModalPage implements OnInit, OnDestroy {
  joinCompanyForm: FormGroup;
  campaign: Campaign;
  companies: any;
  companySelected: any;
  companyPIN: '';
  privacy: any;
  rules: any;
  sub: Subscription;
  isSubmitted = false;

  constructor(
    private modalController: ModalController,
    private alertService: AlertService,
    private campaignService: CampaignService,
    public formBuilder: FormBuilder,
    private translateService: TranslateService
  ) { }
  ngOnInit() {
    this.joinCompanyForm = this.formBuilder.group({
      companySelected: ['', [Validators.required]],
      companyPIN: ['', [Validators.required]],
      privacy: [false, Validators.requiredTrue],
      rules: [false, Validators.requiredTrue]
    });
    this.sub = this.campaignService
      .getCompaniesForSubscription(this.campaign.campaignId)
      .subscribe((result) => {
        if (result) {
          this.companies = result;
        }
      });
    this.rules = this.campaign.details.find(detail => detail.type === 'rules');
    this.privacy = this.campaign.details.find(detail => detail.type === 'privacy');

  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  //computed errorcontrol
  get errorControl() {
    return this.joinCompanyForm.controls;
  }
  close() {
    this.modalController.dismiss();
  }

  openPrivacyPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.privacyPopup.header' as any,
      messageString: this.privacy.content,
      cssClass: 'modalConfirm'
    }
    );
  }

  openRulesPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.rulesPopup.header' as any,
      messageString: this.rules.content,
      cssClass: 'modalConfirm'
    }
    );
  }
  openCodeInfoPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.codeInfo.header' as any,
      messageString: 'campaigns.joinmodal.codeInfo.message' as any,
      cssClass: 'modalConfirm'
    }
    );
  }
  joinCompanySubmit() {
    // call join with all params
    this.isSubmitted = true;
    if (!this.joinCompanyForm.valid) {
      return false;
    } else {
      // console.log('employeeCode' + this.joinCompanyForm.value?.companyPIN + 'companyKey' + );
      const body =
      {
        campaignData: {
          companyKey: this.joinCompanyForm.value?.companySelected?.id,
          employeeCode: this.joinCompanyForm.value?.companyPIN
        }
      };

      this.sub = this.campaignService
        .subscribeToCampaign(this.campaign.campaignId, body)
        .subscribe((result) => {
          if (result) {
            this.alertService.showToast(
              this.translateService.instant('campaigns.registered')
            );
            this.modalController.dismiss();
          }
        }, err => {
          this.alertService.showToast(
            err?.message
          );
        });
    }
  }
}

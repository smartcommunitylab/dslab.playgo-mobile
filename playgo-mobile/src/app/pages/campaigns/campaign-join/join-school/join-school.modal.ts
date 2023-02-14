import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService, UserError } from 'src/app/core/shared/services/error.service';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-join-school',
  templateUrl: './join-school.modal.html',
  styleUrls: ['./join-school.modal.scss'],
})
export class JoinSchoolModalPage implements OnInit, OnDestroy {
  joinSchoolForm: FormGroup;
  campaign: Campaign;
  privacy: any;
  rules: any;
  isSubmitted = false;
  language: string;
  teams: any;
  teamSelected: any;
  sub: Subscription;

  constructor(
    private modalController: ModalController,
    private teamService: TeamService,
    private errorService: ErrorService,
    private alertService: AlertService,
    private campaignService: CampaignService,
    public formBuilder: FormBuilder,
    private userService: UserService,
    private navCtrl: NavController,
    private elementRef: ElementRef
  ) { }
  ngOnInit() {
    this.language = this.userService.getLanguage();
    const rules = this.campaign.details[this.language];
    this.rules = rules?.find((detail) => detail.type === 'rules');
    this.privacy = rules?.find((detail) => detail.type === 'privacy');
    this.joinSchoolForm = this.formBuilder.group({
      teamSelected: ['', [Validators.required]],
      ...(this.privacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.rules && { rules: [false, Validators.requiredTrue] }),
    });
    this.sub = this.teamService.getTeamsForSubscription(this.campaign.campaignId)
      .subscribe((result) => {
        if (result) {
          this.teams = result;
        }
      });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  //computed errorcontrol
  get errorControl() {
    return this.joinSchoolForm.controls;
  }
  close() {
    this.modalController.dismiss(false);
  }

  openPrivacyPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.privacyPopup.header' as any,
      messageString: this.privacy.content,
      cssClass: 'modalJoin'
    });
  }

  openRulesPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.rulesPopup.header' as any,
      messageString: this.rules.content,
      cssClass: 'modalJoin'
    });
  }
  openCodeInfoPopup() {
    this.alertService.presentAlert({
      headerTranslateKey: 'campaigns.joinmodal.codeInfo.header' as any,
      messageString: 'campaigns.joinmodal.codeInfo.message' as any,
      cssClass: 'modalConfirm'
    });
  }
  joinSchoolSubmit() {
    // call join with all params
    this.isSubmitted = true;
    if (!this.joinSchoolForm.valid) {
      return false;
    } else {
      const body = {
        teamId: this.teamSelected.id
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
              this.navCtrl.navigateRoot('/pages/tabs/home');
            }
          },
          (err) => {
            const error = new UserError({
              id: 'ERROR_TEAM',
              message: 'campaigns.joinmodal.error.ERROR_TEAM',
            });
            this.errorService.handleError(error);
          }
        );
    }
  }
  onSelect(event: {
    component: IonicSelectableComponent;
    item: any;
    isSelected: boolean;
  }) {
    console.log(
      'item' + JSON.stringify(event.item) + 'isSelected' + event.isSelected
    );
  }
}

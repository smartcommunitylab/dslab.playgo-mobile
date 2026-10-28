import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { TranslateService } from '@ngx-translate/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { DetailCampaignModalPage } from 'src/app/pages/home/campaign-details/detail-modal/detail.modal';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-campaign-acceptance-modal',
  templateUrl: './campaign-acceptance.modal.html',
  styleUrls: ['./campaign-acceptance.modal.scss'],
  standalone: false,
})
export class CampaignAcceptanceModalComponent implements OnInit {
  @Input() playerCampaign: PlayerCampaign;
  @Input() needsPrivacy = false;
  @Input() needsRules = false;

  form: FormGroup;
  language: string;
  privacyDetail: any;
  rulesDetail: any;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.language = this.userService.getLanguage() || 'it';
    const details =
      this.playerCampaign.campaign?.details?.[this.language] ||
      this.playerCampaign.campaign?.details?.['it'] ||
      [];
    this.rulesDetail = details.find((d: any) => d.type === 'rules');
    this.privacyDetail = details.find((d: any) => d.type === 'privacy');

    this.form = this.formBuilder.group({
      ...(this.needsPrivacy && { privacy: [false, Validators.requiredTrue] }),
      ...(this.needsRules && { rules: [false, Validators.requiredTrue] }),
    });
  }

  async openPrivacyPopup() {
    if (this.privacyDetail?.extUrl) {
      await Browser.open({ url: this.privacyDetail.extUrl });
      return;
    }
    await this.openDetailModal(this.privacyDetail);
  }

  async openRulesPopup() {
    if (this.rulesDetail?.extUrl) {
      await Browser.open({ url: this.rulesDetail.extUrl });
      return;
    }
    await this.openDetailModal(this.rulesDetail);
  }

  private async openDetailModal(detail: any) {
    if (!detail) return;
    const modal = await this.modalCtrl.create({
      component: DetailCampaignModalPage,
      cssClass: 'modalInfo',
      componentProps: {
        detail,
        type: this.playerCampaign?.campaign?.type,
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  confirmAcceptance() {
    if (!this.form.valid) return;
    this.modalCtrl.dismiss({
      action: 'accept',
      privacyAcceptance: this.needsPrivacy ? this.form.value.privacy : true,
      rulesAcceptance: this.needsRules ? this.form.value.rules : true,
    });
  }

  async rejectAndUnsubscribe() {
    const rawMessage = (
      this.translateService.instant('campaigns.acceptance_refuse_warning') || ''
    ).replace(/\\n/g, '\n');

    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('modal.alert_title'),
      message: rawMessage,
      cssClass: 'pre-line-alert',
      buttons: [
        {
          text: this.translateService.instant('modal.cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant(
            'campaigns.acceptance_refuse_confirm_btn'
          ),
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    // Forza il pre-line direttamente sul nodo DOM (funziona sia con che senza Shadow DOM)
    const messageEl = (
      alert.shadowRoot
        ? alert.shadowRoot.querySelector('.alert-message')
        : alert.querySelector('.alert-message')
    ) as HTMLElement;

    if (messageEl) {
      messageEl.style.whiteSpace = 'pre-line';
    }

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.modalCtrl.dismiss({ action: 'unsubscribe' });
    }
  }
}
import { Injectable } from '@angular/core';
import {
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { isString } from 'lodash-es';
import * as itDictionary from '../../../../assets/i18n/it.json';
import { StringPath } from '../type.utils';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private toast: any;
  private loading: any;
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {}
  public async showToast(messageTranslateKey: TranslateKey) {
    const message = await this.translate(messageTranslateKey);
    this.toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    this.toast.present();
  }

  public async confirmAlert(
    headerTranslateKey: TranslateKey,
    messageTranslateKey: TranslateKey,
    cssClass?: string
  ): Promise<boolean> {
    const header = await this.translate(headerTranslateKey);
    const message = await this.translate(messageTranslateKey);
    const cancel = await this.translate('modal.cancel');
    const ok = await this.translate('modal.ok');
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        cssClass,
        header,
        message,
        buttons: [
          {
            text: cancel,
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: ok,
            id: 'confirm-button',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });

      await alert.present();
    });
  }
  public async showLoading(message?: string) {
    this.loading = await this.loadingController.create({
      message,
      duration: 3000,
    });

    await this.loading.present();
  }
  public async dismissLoading() {}

  private async translate(key: TranslateKey): Promise<string> {
    const translated = await this.translateService
      .get(...normalizeTranslateKey(key))
      .toPromise();
    return String(translated);
  }
}

type Dictionary = typeof itDictionary;
export type TranslateKey =
  | StringPath<Dictionary>
  | {
      key: StringPath<Dictionary>;
      interpolateParams: Record<'string', 'string'>;
    };

export function normalizeTranslateKey(
  key: TranslateKey
): [string, Record<'string', 'string'>] {
  return isString(key) ? [key, null] : [key.key, key.interpolateParams];
}

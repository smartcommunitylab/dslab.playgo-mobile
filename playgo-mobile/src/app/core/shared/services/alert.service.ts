import { Injectable } from '@angular/core';
import {
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { isString } from 'lodash-es';
import { TranslateKeyWithParams } from '../type.utils';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private toast: HTMLIonToastElement;
  private loading: any;
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {
    // HACK: fix toast not presented when offline, due to lazy loading the toast controller.
    // Can be removed once #17450 is resolved: https://github.com/ionic-team/ionic/issues/17450
    this.toastController.create({ animated: false }).then((t) => {
      t.present();
      t.dismiss();
    });
  }
  public async showToast(args: {
    messageTranslateKey?: TranslateKeyWithParams;
    messageString?: string;
  }) {
    let message = '';
    if (args.messageTranslateKey) {
      message = await this.translate(args.messageTranslateKey);
    } else if (args.messageString) {
      message = args.messageString;
    }
    try {
      // this can fail if we are offline...
      this.toast = await this.toastController.create({
        message,
        duration: 3000,
        position: 'bottom',
      });
      await this.toast.present();
    } catch (e) {
      //..but the fail is somehow so severe, that it will be not caught, here :(
      console.error('Showing toast failed', e);
      alert(message);
    }
  }

  public async presentAlert(args: {
    headerTranslateKey?: TranslateKeyWithParams;
    messageTranslateKey?: TranslateKeyWithParams;
    cssClass?: string;
    messageString?: string;
  }): Promise<void> {
    const header = await this.translate(args.headerTranslateKey);
    let message = '';
    if (args.messageTranslateKey) {
      message = await this.translate(args.messageTranslateKey);
    } else if (args.messageString) {
      message = args.messageString;
    }
    const ok = await this.translate('modal.ok');
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        cssClass: args.cssClass,
        header,
        message,
        buttons: [
          {
            text: ok,
            id: 'confirm-button',
            handler: () => {
              resolve();
            },
          },
        ],
      });

      await alert.present();
    });
  }
  public async confirmAlert(
    headerTranslateKey: TranslateKeyWithParams,
    messageTranslateKey: TranslateKeyWithParams,
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

  private async translate(key: TranslateKeyWithParams): Promise<string> {
    if (!key) {
      return '';
    }
    const translated = await this.translateService
      .get(...normalizeTranslateKey(key))
      .toPromise();
    return String(translated);
  }
}

export function normalizeTranslateKey(
  key: TranslateKeyWithParams
): [string, Record<string, string>] {
  return isString(key) ? [key, null] : [key.key, key.interpolateParams];
}

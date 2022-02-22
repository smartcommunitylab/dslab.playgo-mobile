/* eslint-disable @typescript-eslint/member-ordering */
import { Inject, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import BackgroundGeolocation, {
  Config,
  Extras,
} from '@transistorsoft/capacitor-background-geolocation';
import { LOW_ACCURACY, TripPart } from './trip.model';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private markAsReady: (val: unknown) => void;
  private isReady = new Promise((resolve, reject) => {
    this.markAsReady = resolve;
  });
  private appConfig = { tracking: { minimalAccuracy: 10 } };

  constructor(
    @Inject(BackgroundGeolocation)
    private backgroundGeolocationPlugin: typeof BackgroundGeolocation,
    public alertController: AlertController
  ) {
    // FIXME: debug only
    (window as any).backgroundGeolocationPlugin =
      this.backgroundGeolocationPlugin;
  }

  async start() {
    try {
      // !!! location will be synced to the public open https://tracker.transistorsoft.com/fbk_dslab
      const debugTokenForPublicServer =
        await this.backgroundGeolocationPlugin.findOrCreateTransistorAuthorizationToken(
          'fbk_dslab',
          'mmikula'
        );

      const config: Config = {
        transistorAuthorizationToken: debugTokenForPublicServer,
        distanceFilter: 10, // <-- your config options as desired
        stopOnTerminate: false,
        startOnBoot: false,
        autoSync: false,
      };
      console.log('starting BackgroundGeolocation', config);
      const state = await this.backgroundGeolocationPlugin.ready(config);
      console.log('BackgroundGeolocation ready', state);
    } catch (e) {
      console.error(e);
    }
    this.markAsReady(true);
  }

  public async syncInitialLocations() {
    await this.isReady;
    await this.backgroundGeolocationPlugin.sync();
    await this.backgroundGeolocationPlugin.stop();
  }

  public async startTracking(tripPart: TripPart) {
    const location = await this.setExtrasAndForceLocation(tripPart);
    const accuracy = location.coords.accuracy;
    if (accuracy < this.appConfig.tracking.minimalAccuracy) {
      const userAcceptsLowAccuracy = await this.showLowAccuracyWarning();
      if (!userAcceptsLowAccuracy) {
        throw LOW_ACCURACY;
      }
    }
    await this.backgroundGeolocationPlugin.start();
  }

  private async showLowAccuracyWarning() {
    return await this.confirmPopup({
      message: 'Low accuracy detected!.',
      cancelText: 'Cancel tracking',
      okText: 'Continue with low accuracy',
    });
  }

  // TODO: move to other service!
  private async confirmPopup({
    okText,
    cancelText,
    message,
  }: {
    okText: string;
    cancelText: string;
    message: string;
  }) {
    let response = false;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: 'Subtitle',
      message: 'Low accuracy detected!.',
      buttons: [
        {
          text: okText,
          handler: () => (response = true),
        },
        cancelText,
      ],
    });

    await alert.present();
    await alert.onDidDismiss();
    return response;
  }

  public async stopTracking() {
    await this.setExtrasAndForceLocation(null);
    await this.backgroundGeolocationPlugin.stop();
    await this.backgroundGeolocationPlugin.sync();
  }
  private async setExtrasAndForceLocation(tripPart: TripPart | null) {
    await this.isReady;
    const extras = this.getExtras(tripPart);
    await this.backgroundGeolocationPlugin.setConfig({ extras });

    return await this.backgroundGeolocationPlugin.getCurrentPosition({
      extras: { ...extras, forced: true },
    });
  }

  private getExtras(tripPart: TripPart | null): TripExtras {
    return {
      idTrip: tripPart?.idTrip,
      multimodalId: tripPart?.multimodalId,
      start: tripPart?.start,
      transportType: tripPart?.transportType,
    };
  }
}

interface TripExtras extends Extras, TripPart {}

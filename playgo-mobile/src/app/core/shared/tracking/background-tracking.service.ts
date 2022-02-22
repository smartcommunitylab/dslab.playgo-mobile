/* eslint-disable @typescript-eslint/member-ordering */
import { Inject, Injectable } from '@angular/core';
import BackgroundGeolocation, {
  Config,
  Extras,
} from '@transistorsoft/capacitor-background-geolocation';
import { TripPart } from './trip.model';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private markAsReady: (val: unknown) => void;
  private isReady = new Promise((resolve, reject) => {
    this.markAsReady = resolve;
  });

  constructor(
    @Inject(BackgroundGeolocation)
    private backgroundGeolocationPlugin: typeof BackgroundGeolocation
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
    await this.isReady;
    const extras = this.getExtras(tripPart);
    await this.backgroundGeolocationPlugin.setConfig({ extras });

    await this.backgroundGeolocationPlugin.getCurrentPosition({
      extras: { ...extras, forced: true },
    });

    await this.backgroundGeolocationPlugin.start();
  }

  private getExtras(tripPart: TripPart): TripExtras {
    return {
      idTrip: tripPart.idTrip,
      multimodalId: tripPart.multimodalId,
      start: tripPart.start,
      transportType: tripPart.transportType,
    };
  }
}

interface TripExtras extends Extras, TripPart {}

/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
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

  constructor() {
    // FIXME: debug only
    (window as any).BackgroundGeolocation = BackgroundGeolocation;
  }

  async start() {
    try {
      // !!! location will be synced to the public open https://tracker.transistorsoft.com/fbk_dslab
      const debugTokenForPublicServer =
        await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(
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
      const state = await BackgroundGeolocation.ready(config);
      console.log('BackgroundGeolocation ready', state);
    } catch (e) {
      console.error(e);
    }
    this.markAsReady(true);
  }

  public async syncInitialLocations() {
    await this.isReady;
    await BackgroundGeolocation.sync();
    await BackgroundGeolocation.stop();
  }

  public async startTracking(tripPart: TripPart) {
    await this.isReady;
    const extras = this.getExtras(tripPart);
    await BackgroundGeolocation.setConfig({ extras });

    await BackgroundGeolocation.getCurrentPosition({
      extras: { ...extras, forced: true },
    });

    await BackgroundGeolocation.start();
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

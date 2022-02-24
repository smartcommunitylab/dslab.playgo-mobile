/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  BackgroundGeolocation,
  State,
  Location,
} from '@transistorsoft/capacitor-background-geolocation';
import { last, mapValues } from 'lodash-es';
import { Config } from 'protractor';

export class BackgroundGeolocationMock {
  private static locations: Partial<Location>[] = [];
  private static config: Config = { extras: {} };
  private static isTracking = false;
  private static handlers = new Set<(location: Partial<Location>) => void>();

  constructor() {
    throw new Error('static mock');
  }
  public static findOrCreateTransistorAuthorizationToken() {
    log('findOrCreateTransistorAuthorizationToken');
    return 'TOKEN_MOCK';
  }
  public static async ready(config: Config): Promise<Partial<State>> {
    log('ready called!', config);
    await time(1000);
    log('ready finished!');
    return {
      enabled: true,
    };
  }
  public static async setConfig(config: Config) {
    log('setConfig called!', config);
    BackgroundGeolocationMock.config = config;
    await time(1000);
    log('setConfig finished!');
  }
  public static async getCurrentPosition(config: Config) {
    log('getCurrentPosition called!', config);
    await time(1000);
    const location = BackgroundGeolocationMock.getRandomLocation();
    BackgroundGeolocationMock.locations.push(location);
    log('getCurrentPosition finished!', location);
    return location;
  }
  public static async start() {
    log('start called!');
    await time(1000);
    BackgroundGeolocationMock.isTracking = true;
    log('start finished!');
  }
  public static async stop() {
    log('stop called!');
    await time(1000);
    BackgroundGeolocationMock.isTracking = false;
    log('stop finished!');
  }
  public static async sync() {
    log('sync called!');
    await time(1000);
    BackgroundGeolocationMock.locations = [];
    log('sync finished!');
  }
  public static async getLocations() {
    log('getLocations called!');
    await time(1000);
    log('getLocations finished!', BackgroundGeolocationMock.locations);
    return [...BackgroundGeolocationMock.locations];
  }
  public static onLocation(handler) {
    log('onLocation handler added!', handler);
    BackgroundGeolocationMock.handlers.add(handler);
    return {
      remove: () => {
        BackgroundGeolocationMock.handlers.delete(handler);
        log('onLocation subscription removed!');
      },
    };
  }

  private static getRandomLocation(): Partial<Location> {
    const lastCoords = last(BackgroundGeolocationMock.locations)?.coords || {
      latitude: 46.06787,
      longitude: 11.12108,
    };
    const newCoords = mapValues(lastCoords, (coord) => coord + 0.1);
    return {
      coords: {
        ...newCoords,
        accuracy: Math.random() * 20,
      },
      extras: BackgroundGeolocationMock.config.extras,
    };
  }
  private static initMockTracking() {
    setInterval(() => {
      if (BackgroundGeolocationMock.isTracking) {
        const location = BackgroundGeolocationMock.getRandomLocation();
        BackgroundGeolocationMock.locations.push(location);
        BackgroundGeolocationMock.handlers.forEach((handler) =>
          handler(location)
        );
      }
    }, 5000);
  }

  static {
    BackgroundGeolocationMock.initMockTracking();
  }
}

function log(...args) {
  console.log('BackgroundGeolocationMock:', ...args);
}
async function time(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

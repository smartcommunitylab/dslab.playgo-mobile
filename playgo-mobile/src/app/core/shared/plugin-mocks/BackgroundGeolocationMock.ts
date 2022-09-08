/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  BackgroundGeolocation,
  State,
  Location,
  CurrentPositionRequest,
  Extras,
} from '@transistorsoft/capacitor-background-geolocation';
import { last, mapValues, random, sample } from 'lodash-es';
import { Config } from 'protractor';
import { getMockMethodAnnotation } from './mock-utils';

const mockMethod = getMockMethodAnnotation({
  doLog: false,
  logPrefix: 'BackgroundGeolocationMock',
});

export class BackgroundGeolocationMock {
  private static locations: Partial<Location>[] = [];
  private static config: Config = { extras: {} };
  private static isTracking = false;
  private static handlers = new Set<(location: Partial<Location>) => void>();

  constructor() {
    throw new Error('static mock');
  }
  @mockMethod()
  public static findOrCreateTransistorAuthorizationToken() {
    return 'TOKEN_MOCK';
  }
  @mockMethod({ async: true })
  public static async ready(config: Config): Promise<Partial<State>> {
    return {
      enabled: true,
    };
  }

  @mockMethod({ async: true })
  public static async setConfig(config: Config) {
    BackgroundGeolocationMock.config = config;
  }
  @mockMethod({ async: true, wait: 1000 })
  public static async getCurrentPosition(request: CurrentPositionRequest) {
    const location = BackgroundGeolocationMock.getRandomLocation(
      request.extras
    );
    if (request?.persist !== false) {
      BackgroundGeolocationMock.locations.push(location);
    }
    return location;
  }
  @mockMethod({ async: true })
  public static async start() {
    BackgroundGeolocationMock.isTracking = true;
  }
  @mockMethod({ async: true })
  public static async stop() {
    BackgroundGeolocationMock.isTracking = false;
  }
  @mockMethod({ async: true })
  public static async destroyLocations() {
    BackgroundGeolocationMock.isTracking = false;
  }
  @mockMethod({ async: true })
  public static async sync() {
    const locations = BackgroundGeolocationMock.locations;
    BackgroundGeolocationMock.locations = [];
    return locations;
  }
  @mockMethod({ async: true })
  public static async getLocations() {
    return [...BackgroundGeolocationMock.locations];
  }

  @mockMethod()
  public static onLocation(handler: (location: Partial<Location>) => void) {
    BackgroundGeolocationMock.handlers.add(handler);
    return {
      remove: () => {
        BackgroundGeolocationMock.handlers.delete(handler);
        console.log(
          'BackgroundGeolocationMock: onLocation subscription removed!'
        );
      },
    };
  }

  @mockMethod()
  public static onPowerSaveChange(handler: any) {
    return {
      remove: () => {},
    };
  }

  @mockMethod({ async: true })
  public static async isPowerSaveMode() {
    return false;
  }

  private static getRandomLocation(extras: Extras = {}): Partial<Location> {
    const lastCoords = last(BackgroundGeolocationMock.locations)?.coords || {
      latitude: 46.06787,
      longitude: 11.12108,
    };
    const newCoords = mapValues(
      lastCoords,
      (coord) => coord + random(-0.001, 0.001)
    );
    return {
      coords: {
        ...newCoords,
        accuracy: 10 + Math.random() * 20,
      },
      timestamp: new Date().toISOString(),
      extras: {
        ...BackgroundGeolocationMock.config.extras,
        ...extras,
      },
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

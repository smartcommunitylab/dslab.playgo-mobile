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
  @mockMethod({ async: true })
  public static async getCurrentPosition(request: CurrentPositionRequest) {
    const location = BackgroundGeolocationMock.getRandomLocation(
      request.extras
    );
    BackgroundGeolocationMock.locations.push(location);
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
  public static onLocation(handler) {
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
  public static onPowerSaveChange(handler) {
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

async function time(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
function mockMethod(opts: { async: boolean } = { async: false }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const targetMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // console.log(`BackgroundGeolocationMock.${propertyKey} called:`, ...args);
      const res = targetMethod.apply(this, args);
      if (opts.async) {
        return (async () => {
          const promiseRes = await res;
          await time(200);
          // console.log(
          //   `BackgroundGeolocationMock.${propertyKey} finished:`,
          //   promiseRes
          // );
          return promiseRes;
        })();
      } else {
        // console.log(`BackgroundGeolocationMock.${propertyKey} result`, res);
      }
    };
    return descriptor;
  };
}

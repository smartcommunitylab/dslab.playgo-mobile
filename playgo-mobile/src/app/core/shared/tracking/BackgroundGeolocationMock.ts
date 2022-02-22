/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  BackgroundGeolocation,
  State,
} from '@transistorsoft/capacitor-background-geolocation';
import { Config } from 'protractor';

export class BackgroundGeolocationMock
  implements Partial<BackgroundGeolocation>
{
  constructor() {}
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
    await time(1000);
    log('setConfig finished!');
  }
  public static async getCurrentPosition(config: Config) {
    log('getCurrentPosition called!', config);
    await time(1000);
    log('getCurrentPosition finished!');
  }
  public static async start() {
    log('start called!');
    await time(1000);
    log('start finished!');
  }
  public static async stop() {
    log('stop called!');
    await time(1000);
    log('stop finished!');
  }
  public static async sync() {
    log('sync called!');
    await time(1000);
    log('sync finished!');
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

import { App, AppInfo } from '@capacitor/app';
import { getMockMethodAnnotation } from './mock-utils';

const mockMethod = getMockMethodAnnotation({
  doLog: false,
  logPrefix: 'AppPluginMock',
});

export class AppPluginMock {
  constructor() {
    throw new Error('static mock');
  }
  @mockMethod({ async: true })
  public static async getInfo(): Promise<Partial<AppInfo>> {
    return {
      version: 'dev',
    };
  }
}

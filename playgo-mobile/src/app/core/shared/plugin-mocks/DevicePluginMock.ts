import { DeviceInfo } from '@capacitor/device';
import { getMockMethodAnnotation } from './mock-utils';

const mockMethod = getMockMethodAnnotation({
  doLog: true,
  logPrefix: 'DevicePluginMock',
});

export class DevicePluginMock {
  constructor() {
    throw new Error('static mock');
  }
  @mockMethod({ async: true })
  public static async getInfo(): Promise<Partial<DeviceInfo>> {
    return {
      platform: 'web',
      name: 'mocked device info',
    };
  }
}

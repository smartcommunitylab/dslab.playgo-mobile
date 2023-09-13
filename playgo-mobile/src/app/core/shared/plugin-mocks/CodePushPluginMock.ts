import { ILocalPackage } from '@dwimcore/capacitor-codepush/dist/esm/package';
import { SyncStatus } from '@dwimcore/capacitor-codepush/dist/esm/syncStatus';
import { getMockMethodAnnotation } from './mock-utils';

const mockMethod = getMockMethodAnnotation({
  doLog: false,
  logPrefix: 'CodePushPluginMock',
});

export class CodePushPluginMock {
  constructor() {
    throw new Error('static mock');
  }

  @mockMethod({ async: true })
  public static async sync(config: any): Promise<SyncStatus> {
    return 'sync_mocked' as unknown as SyncStatus;
  }

  @mockMethod({ async: true })
  public static async getCurrentPackage(): Promise<ILocalPackage> {
    return {
      label: '-',
    } as ILocalPackage;
  }
  @mockMethod({ async: true })
  public static async getPendingPackage(): Promise<ILocalPackage> {
    return null;
  }
}

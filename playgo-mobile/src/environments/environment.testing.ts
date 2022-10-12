/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Dev like environment, but with production servers
 */
import { environment as devEnvironment } from './environment.dev';
import { Environment } from './type-environment';

export const environment: Environment = {
  ...devEnvironment,
  name: 'testing',
  serverUrl: {
    api: 'https://backend.playngo.it:443',
    apiPath: '/playandgo/api',
    pgaziendeUrl:
      'https://pgaziendaleprod.platform.smartcommunitylab.it/api/public',
    hscApi: 'https://hsc.playngo.it/playandgo-hsc/publicapi/',
  },
};

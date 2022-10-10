/* eslint-disable @typescript-eslint/naming-convention */
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: Environment = {
  name: 'Development',
  production: false,
  useCodePush: false,
  support: {
    privacy: 'https://www.smartcommunitylab.it/playandgo-privacy-policy/',
    faq: 'https://www.smartcommunitylab.it/playgo_faq/',
    email: 'playandgo@smartcommunitylab.it',
  },
  authConfig: {
    server_host: 'https://aac.platform.smartcommunitylab.it',
    client_id: 'c_5445634c-95d6-4c0e-a1ff-829b951b91b3',
    redirect_url: 'it.dslab.playgo://callback',
    end_session_redirect_url: 'it.dslab.playgo://endsession',
    scopes: 'openid email profile offline_access',
    automaticSilentRenew: true,
    pkce: true,
  },
  idp_hint: {
    facebook: 'koi8jw8x',
    google: 'Nqoa1EDO',
    apple: 'owbERvU0',
  },
  serverUrl: {
    api: 'https://backenddev.playngo.it:443',
    apiPath: '/playandgo/api',
    pgaziendeUrl:
      'https://pgaziendaledev.platform.smartcommunitylab.it/api/public',
    hscApi: 'https://hscdev.playngo.it/playandgo-hsc/publicapi',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error'; // Included with Angular CLI.

import { assertDictionariesAreEqualInRuntime } from 'src/app/core/shared/globalization/i18n/check-dictio-runtime';
import { Environment } from './type-environment';
assertDictionariesAreEqualInRuntime();

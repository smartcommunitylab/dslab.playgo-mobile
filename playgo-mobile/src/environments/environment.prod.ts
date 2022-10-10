/* eslint-disable @typescript-eslint/naming-convention */
export const environment: Environment = {
  name: 'Production',
  production: true,
  useCodePush: true,
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
    api: 'https://backend.playngo.it:443',
    apiPath: '/playandgo/api',
    pgaziendeUrl:
      'https://pgaziendaleprod.platform.smartcommunitylab.it/api/public',
    hscApi: 'https://hsc.playngo.it/playandgo-hsc/publicapi/',
  },
};

// ---------- Check if translation are same for it, en ----------------- //
import 'src/app/core/shared/globalization/i18n/check-dictio-compiletime';
import { Environment } from './type-environment';

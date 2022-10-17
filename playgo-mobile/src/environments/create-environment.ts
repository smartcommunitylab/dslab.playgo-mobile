/* eslint-disable @typescript-eslint/naming-convention */

import { assertDictionariesAreEqualInRuntime } from 'src/app/core/shared/globalization/i18n/check-dictio-runtime';

export function createEnvironment(
  opts: Required<EnvironmentOptions>
): Environment {
  const environment: Environment = {
    name: opts.name,
    production: opts.releaseToStore,
    useCodePush: opts.releaseToStore,
    support: {
      privacy: 'https://www.smartcommunitylab.it/playandgo-privacy-policy/',
      faq: 'https://www.smartcommunitylab.it/playgo_faq/',
      email: 'playandgo@smartcommunitylab.it',
    },
    authConfig: getAuthConfig(opts.aacConfig),
    idp_hint: {
      facebook: 'koi8jw8x',
      google: 'Nqoa1EDO',
      apple: 'owbERvU0',
    },
    serverUrl: getServerUrlConfig(opts.apiServer),
  };

  if (opts.releaseToStore === false) {
    assertDictionariesAreEqualInRuntime();
  }

  return environment;
}

function getAuthConfig(
  aacConfig: 'default' | 'stage'
): Environment['authConfig'] {
  if (aacConfig === 'default') {
    return {
      server_host: `https://aac.platform.smartcommunitylab.it`,
      client_id: `c_17006045-af42-467e-bc86-8e826012c1de`,
      redirect_url: `it.dslab.playgo://callback`,
      end_session_redirect_url: `it.dslab.playgo://endsession`,
      scopes: 'openid email profile offline_access',
      automaticSilentRenew: true,
      pkce: true,
    };
  }
  if (aacConfig === 'stage') {
    return {
      server_host: `https://aac.platform.smartcommunitylab.it`,
      client_id: `c_17006045-af42-467e-bc86-8e826012c1de`,
      redirect_url: `it.dslab.playgo.stage://callback`,
      end_session_redirect_url: `it.dslab.playgo.stage://endsession`,
      scopes: 'openid email profile offline_access',
      automaticSilentRenew: true,
      pkce: true,
    };
  }
  throw Error('unknown aacConfig variant: ' + aacConfig);
}

function getServerUrlConfig(
  apiServer: 'dev' | 'prod'
): Environment['serverUrl'] {
  if (apiServer === 'dev') {
    return {
      api: 'https://backenddev.playngo.it:443',
      apiPath: '/playandgo/api',
      pgaziendeUrl:
        'https://pgaziendaletest.platform.smartcommunitylab.it/api/public',
      hscApi: 'https://hscdev.playngo.it/playandgo-hsc/publicapi/',
    };
  }
  if (apiServer === 'prod') {
    return {
      api: 'https://backend.playngo.it:443',
      apiPath: '/playandgo/api',
      pgaziendeUrl:
        'https://pgaziendaleprod.platform.smartcommunitylab.it/api/public',
      hscApi: 'https://hsc.playngo.it/playandgo-hsc/publicapi/',
    };
  }
  throw Error('unknown apiServer variant: ' + apiServer);
}

interface EnvironmentOptions {
  name: string;
  releaseToStore: boolean;
  aacConfig: 'default' | 'stage';
  apiServer: 'dev' | 'prod';
}

export interface Environment {
  production: boolean;
  useCodePush: boolean;
  name: string;
  support: {
    privacy: string;
    faq: string;
    email: string;
  };
  authConfig: {
    server_host: string;
    client_id: string;
    redirect_url: string;
    end_session_redirect_url: string;
    scopes: string;
    automaticSilentRenew: boolean;
    pkce: boolean;
  };
  idp_hint: {
    facebook: string;
    google: string;
    apple: string;
  };
  serverUrl: {
    api: string;
    apiPath: string;
    pgaziendeUrl: string;
    hscApi: string;
  };
}

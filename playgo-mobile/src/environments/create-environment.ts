/* eslint-disable @typescript-eslint/naming-convention */

import { assertDictionariesAreEqualInRuntime } from 'src/app/core/shared/globalization/i18n/check-dictio-runtime';

/**
 * Our environment configuration is little complex, so we are using a factory to create it.
 *
 * Main problem is, that angular does not support "multi dimensional" environment files. In
 * the same matter that for example android does. For example, we would like to specify which
 * api server (dev/prod) to use independently from angular build optimizations (dev/prod). We would
 * like to have also build without minified code, with source maps, but with prod
 * api server - to test or debug it.
 *
 * This function is creating "joined" environment, based on different "dimensions" of configuration.
 * Each dimension is represented by one field of 'EnvironmentOptions' interface.
 * Description of dimensions in 'EnvironmentOptions' interface.
 *
 * @see EnvironmentOptions
 *
 * @param opts
 * @returns
 */
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
      client_id: `c_5445634c-95d6-4c0e-a1ff-829b951b91b3`,
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
      client_id: `c_5445634c-95d6-4c0e-a1ff-829b951b91b3`,
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
      pgaziendePublicUrl:
        'https://pgaziendaledev.platform.smartcommunitylab.it/api/public',
      pgaziendeUrl:
        'https://pgaziendaledev.platform.smartcommunitylab.it/api',
      hscApi: 'https://hscdev.playngo.it',
    };
  }
  if (apiServer === 'prod') {
    return {
      api: 'https://backend.playngo.it:443',
      apiPath: '/playandgo/api',
      pgaziendePublicUrl:
        'https://pgaziendale.platform.smartcommunitylab.it/api/public',
      pgaziendeUrl:
        'https://pgaziendale.platform.smartcommunitylab.it/api',
      hscApi: 'https://hsc.playngo.it',
    };
  }
  throw Error('unknown apiServer variant: ' + apiServer);
}

/**
 * Joint configuration, from which full configuration will be made. Each property
 * controls different dimension of configuration of the resulting environment.
 */
interface EnvironmentOptions {
  /**
   * Name of the environment. It is used only for informational purposes.
   * It will be displayed on the about page.
   */
  name: string;
  /**
   * Angular build optimization. Controls also if we are using code push or not.
   */
  releaseToStore: boolean;
  /**
   * Aac server configuration to use (default/stage). "stage" is using different
   * callback url, so it should be used only in stage android/ios builds.
   */
  aacConfig: 'default' | 'stage';
  /**
   * Api servers configuration to use (dev/prod). Controls also aziende and
   * high school challenge servers.
   */
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
    pgaziendePublicUrl: string;
    pgaziendeUrl: string;
    hscApi: string;
  };
}

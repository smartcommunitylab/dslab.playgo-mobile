/* eslint-disable @typescript-eslint/naming-convention */
/**
 * stage environment. To be used with stage productFlavors on Android and iOS
 * see android\app\build.gradle
 * Main differences is separate url schema and acc
 */
import { environment as prodEnvironment } from './environment.prod';
import { Environment } from './type-environment';

export const environment: Environment = {
  ...prodEnvironment,
  name: 'Stage',
  authConfig: {
    server_host: 'https://aac.platform.smartcommunitylab.it',
    client_id: 'c_5445634c-95d6-4c0e-a1ff-829b951b91b3',
    redirect_url: 'it.dslab.playgo.stage://callback',
    end_session_redirect_url: 'it.dslab.playgo.stage://endsession',
    scopes: 'openid email profile offline_access',
    automaticSilentRenew: true,
    pkce: true,
  },
};

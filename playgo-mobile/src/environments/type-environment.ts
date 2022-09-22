/* eslint-disable @typescript-eslint/naming-convention */

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
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
}

export const environment = {
  production: true,
  authConfig: {
    serverHost: 'https://aac.platform.smartcommunitylab.it',
    clientId: 'c_5445634c-95d6-4c0e-a1ff-829b951b91b3',
    redirectUrl: 'it.dslab.playgo://callback',
    endSessionRedirectUrl: 'it.dslab.playgo://endsession',
    scopes: 'openid email profile',
    pkce: true,
  },
};

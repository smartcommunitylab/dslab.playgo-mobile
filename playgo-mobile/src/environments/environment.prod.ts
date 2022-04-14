/* eslint-disable @typescript-eslint/naming-convention */
export const environment = {
  production: true,
  authConfig: {
    server_host: 'https://aac.platform.smartcommunitylab.it',
    client_id: 'c_5445634c-95d6-4c0e-a1ff-829b951b91b3',
    redirect_url: 'it.dslab.playgo://callback',
    end_session_redirect_url: 'it.dslab.playgo://endsession',
    scopes: 'openid email profile offline_access',
    automaticSilentRenew: true,
    pkce: true,
  },
  serverUrl: {
    apiUrl: 'https://backenddev.playngo.it:443/playandgo/api/',
    register: 'player/register',
    profile: 'player/profile',
    player: 'player',
    avatar: 'player/avatar',
    territory: 'territory',
  },
  firebaseConfig: {
    apiKey: 'AIzaSyBBUsW8BpWEgWIe45M34sgPIiCN-ssw4gY',
    authDomain: 'analyticsdemo-1ee4c.firebaseapp.com',
    projectId: 'analyticsdemo-1ee4c',
    storageBucket: 'analyticsdemo-1ee4c.appspot.com',
    messagingSenderId: '638917288616',
    appId: '1:638917288616:web:2979eb96b7d6fd2772989d',
    measurementId: 'G-M3H7W563GY',
  },
};

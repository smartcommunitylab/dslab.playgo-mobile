/* eslint-disable @typescript-eslint/naming-convention */
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
    profile: 'player/profile',
    register: 'player/register',
    player: 'player',
    territory: 'territory',
    avatar: 'player/avatar',
    status: '/report/player/status',
    transportStats: 'report/player/transport/stats'
  },
  firebaseConfig: {
    apiKey: 'AIzaSyC4jMIUaDnXVITplF2jIjhw2ElgUMillHE',
    authDomain: 'playgo-mobile.firebaseapp.com',
    projectId: 'playgo-mobile',
    storageBucket: 'playgo-mobile.appspot.com',
    messagingSenderId: '187362305431',
    appId: '1:187362305431:web:6b28040d084512431810d2',
    measurementId: 'G-5QRQJTP30R'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

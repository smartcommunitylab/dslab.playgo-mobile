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
    scopes: 'openid email profile',
    pkce: true,
  },
  serverUrl: {
    apiUrl: 'https://backenddev.playngo.it:443/playandgo/api/',
    profile: 'player/profile',
    register: 'player/register',
    player: 'player',
    territory: 'territory',
  },
  firebaseConfig: {
    apiKey: 'AIzaSyBBUsW8BpWEgWIe45M34sgPIiCN-ssw4gY',
    authDomain: 'analyticsdemo-1ee4c.firebaseapp.com',
    projectId: 'analyticsdemo-1ee4c',
    storageBucket: 'analyticsdemo-1ee4c.appspot.com',
    messagingSenderId: '638917288616',
    appId: '1:638917288616:web:2979eb96b7d6fd2772989d',
    measurementId: 'G-M3H7W563GY'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';

const productionFlavorConfig: CapacitorConfig = {
  // appId and appName are used only for initializing the native project
  // appId: 'it.dslab.playgo',
  // appName: 'Play&Go',
  webDir: 'www',
  bundledWebRuntime: false,
  server: { allowNavigation: ['*'] },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      splashFullScreen: false,
      splashImmersive: false,
      backgroundColor: '#01579B',
      androidScaleType: 'CENTER_CROP',
      androidSplashResourceName: 'splash',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    CodePush: {
      ANDROID_DEPLOY_KEY: 'NiSk40OVMGOakRCneMkpabXrskEC4ksvOXqog',
      IOS_DEPLOY_KEY: 'zb5HmAnKlI5QKIjJCLjC375GAEsf4ksvOXqog',
      ANDROID___STAGING___DEPLOY_KEY: 'URuryzYvyd6Q13lQwdxdtofY2vMt4ksvOXqog',
      ANDROID___PROD______DEPLOY_KEY: 'NiSk40OVMGOakRCneMkpabXrskEC4ksvOXqog',
      IOS_______STAGING_________DEPLOY_KEY:
        'KAihplQ1hjbJ0Rsw0yA2r6GSD2op4ksvOXqog',
      IOS_______PROD_________DEPLOY_KEY:
        'zb5HmAnKlI5QKIjJCLjC375GAEsf4ksvOXqog',
      SERVER_URL: 'https://code-push-server.platform.smartcommunitylab.it',
    },
  },
};

const stageFlavorConfig: CapacitorConfig = {
  ...productionFlavorConfig,
  plugins: {
    ...productionFlavorConfig.plugins,
    CodePush: {
      ANDROID_DEPLOY_KEY: 'URuryzYvyd6Q13lQwdxdtofY2vMt4ksvOXqog',
      IOS_DEPLOY_KEY: 'KAihplQ1hjbJ0Rsw0yA2r6GSD2op4ksvOXqog',
    },
  },
};

let config: CapacitorConfig;
if (process.env.FLAVOR === 'stage') {
  console.log('Using stage flavor in capacitor.config.ts');
  config = stageFlavorConfig;
} else {
  console.log('Using production flavor in capacitor.config.ts');
  config = productionFlavorConfig;
}

export default config;

/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';

const flavor: 'stage' | 'production' =
  process.env.FLAVOR === 'stage' ? 'stage' : 'production';

const configBase: CapacitorConfig = {
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
      // we store used flavor (stage/production), so it could be accessed from java, and then sent
      // to javascript. In the end this value will be shown in 'About' screen.
      flavor,
      SERVER_URL: 'https://code-push-server.platform.smartcommunitylab.it',
    },
  },
};

const stageFlavorConfig: CapacitorConfig = {
  ...configBase,
  plugins: {
    ...configBase.plugins,
    CodePush: {
      ...configBase.plugins.CodePush,
      ANDROID_DEPLOY_KEY: 'URuryzYvyd6Q13lQwdxdtofY2vMt4ksvOXqog',
      IOS_DEPLOY_KEY: 'KAihplQ1hjbJ0Rsw0yA2r6GSD2op4ksvOXqog',
    },
  },
};
const productionFlavorConfig: CapacitorConfig = {
  ...configBase,
  plugins: {
    ...configBase.plugins,
    CodePush: {
      ...configBase.plugins.CodePush,
      ANDROID_DEPLOY_KEY: 'NiSk40OVMGOakRCneMkpabXrskEC4ksvOXqog',
      IOS_DEPLOY_KEY: 'zb5HmAnKlI5QKIjJCLjC375GAEsf4ksvOXqog',
    },
  },
};

console.log(`using ${flavor} flavor in capacitor.config.ts`);

let config: CapacitorConfig;
if (flavor === 'stage') {
  config = stageFlavorConfig;
} else if (flavor === 'production') {
  config = productionFlavorConfig;
} else {
  throw new Error('Unsupported flavor');
}

export default config;

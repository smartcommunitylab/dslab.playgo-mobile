

/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

// Recupera il "flavor" da variabile ambiente o fallback a 'production'
const flavor = (process?.env?.FLAVOR as 'stage' | 'production') || 'production';

const baseConfig: CapacitorConfig = {
  appId: `it.dslab.playgo.${flavor}`,
  appName: 'playGo',
  webDir: 'www',
  server: { allowNavigation: ['*'] },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,

    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      splashFullScreen: false,
      splashImmersive: false,
      backgroundColor: '#01579B',
      androidScaleType: 'CENTER_CROP',
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      overlaysWebView: true
    },
    android: {
      webContentsDebuggingEnabled: true,
      adjustMarginsForEdgeToEdge: "auto"
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

// Configurazioni specifiche per ciascun flavor
const stageConfig: CapacitorConfig = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    CodePush: {
      ...baseConfig.plugins.CodePush,
      ANDROID_DEPLOY_KEY: 'URuryzYvyd6Q13lQwdxdtofY2vMt4ksvOXqog',
      IOS_DEPLOY_KEY: 'KAihplQ1hjbJ0Rsw0yA2r6GSD2op4ksvOXqog',
    },
  },
};

const productionConfig: CapacitorConfig = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    CodePush: {
      ...baseConfig.plugins.CodePush,
      ANDROID_DEPLOY_KEY: 'NiSk40OVMGOakRCneMkpabXrskEC4ksvOXqog',
      IOS_DEPLOY_KEY: 'zb5HmAnKlI5QKIjJCLjC375GAEsf4ksvOXqog',
    },
  },
};

// Seleziona il config attivo
const config: CapacitorConfig =
  flavor === 'stage' ? stageConfig : productionConfig;

// (facoltativo, utile per debug)
console.log(`✅ Using Capacitor flavor: ${flavor}`);

export default config;

// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'it.dslab.playgo.stage',
//   appName: 'playGo',
//   webDir: 'www'
// };

// export default config;

/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';

// Recupera il "flavor" da variabile ambiente o fallback a 'production'
const flavor = (process?.env?.FLAVOR as 'stage' | 'production') || 'production';

const baseConfig: CapacitorConfig = {
  appId: `it.dslab.playgo.${flavor}`,
  appName: 'playGo',
  webDir: 'www',
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
    android: {
      webContentsDebuggingEnabled: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

// Configurazioni specifiche per ciascun flavor
const stageConfig: CapacitorConfig = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins
  },
};

const productionConfig: CapacitorConfig = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins
  },
};

// Seleziona il config attivo
const config: CapacitorConfig =
  flavor === 'stage' ? stageConfig : productionConfig;

// (facoltativo, utile per debug)
console.log(`✅ Using Capacitor flavor: ${flavor}`);

export default config;

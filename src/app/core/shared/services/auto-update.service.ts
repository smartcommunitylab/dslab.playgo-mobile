import { Injectable } from '@angular/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorHttp } from '@capacitor/core'; 
import { SplashScreen } from '@capacitor/splash-screen';

interface UpdateManifestEntry {
  version: string;
  url: string;
  checksum: string;
  platform: string;
  app_version: string;
  flavor: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class AutoUpdateService {
  
  private readonly MANIFEST_URL = 'https://raw.githubusercontent.com/smartcommunitylab/dslab.playgo-mobile/capgo-test/updates-manifest.json';

  constructor() {}

  async init(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await CapacitorUpdater.notifyAppReady();
      await this.checkForUpdate();
    } catch (e) { 
      console.error('❌ Init Update Error:', e); 
    }
  }

  async checkForUpdate(): Promise<void> {
    try {
      // 1. Info App Corrente
      const appInfo = await App.getInfo();
      const nativeVersion = appInfo.version;
      const appId = appInfo.id;
      const platform = Capacitor.getPlatform(); 
      const flavor = appId.includes('.stage') ? 'stage' : 'production';

      const currentBundle = await CapacitorUpdater.current();
      const currentWebVersion = (currentBundle.bundle.version === 'builtin' || !currentBundle.bundle.version) 
                                ? '0.0.0' : currentBundle.bundle.version;

      console.log(`🔍 Check Update | Platform: ${platform} | Flavor: ${flavor}`);
      console.log(`📱 Native: ${nativeVersion} | Web: ${currentWebVersion}`);

      // 2. Scarica Manifest
      const response = await CapacitorHttp.get({ url: this.MANIFEST_URL });
      
      if (response.status !== 200 || !response.data) {
        console.log('❌ Impossibile scaricare manifest');
        return;
      }

      console.log('📥 Manifest response type:', typeof response.data);
      console.log('📥 Manifest data:', response.data);

      // Parse manifest - gestisce sia stringa che oggetto
      let manifest: UpdateManifestEntry[];
      try {
        if (typeof response.data === 'string') {
          manifest = JSON.parse(response.data);
        } else if (Array.isArray(response.data)) {
          manifest = response.data;
        } else {
          console.error('❌ Formato manifest non valido:', response.data);
          return;
        }
      } catch (e) {
        console.error('❌ Errore parsing manifest:', e);
        return;
      }

      if (!Array.isArray(manifest)) {
        console.error('❌ Manifest non è un array:', manifest);
        return;
      }

      console.log(`📋 Manifest entries: ${manifest.length}`);
        
      // 3. Filtra per Piattaforma, Flavor e Compatibilità
      const compatibleUpdates = manifest.filter(entry => 
        entry.platform === platform &&
        entry.flavor === flavor &&
        this.isNativeVersionCompatible(nativeVersion, entry.app_version)
      );

      // 4. Prendi la versione più alta
      const latestUpdate = compatibleUpdates.reduce((prev, current) => 
        this.compareVersions(current.version, prev.version) === 1 ? current : prev
      );

      console.log(`📡 Versione disponibile: v${latestUpdate.version}`);

      // 5. Confronta con versione corrente
      if (this.compareVersions(latestUpdate.version, currentWebVersion) === 1) {
        console.log('🚀 Nuova versione trovata! Inizio download...');

        const update = await CapacitorUpdater.download({
          url: latestUpdate.url,
          version: latestUpdate.version,
          checksum: latestUpdate.checksum
        });
        
        if (update) {
          SplashScreen.show();
          try {
            await CapacitorUpdater.set(update);
            console.log('✅ Update installato!');
          } catch (error) {
            console.error('❌ Errore installazione:', error);
            SplashScreen.hide();
          }
        }
      } else {
        console.log('✅ Versione già aggiornata.');
      }

    } catch (error) {
      console.error('❌ Errore Update:', error);
    }
  }

  private isNativeVersionCompatible(currentNative: string, requiredNative: string): boolean {
    // Verifica che la versione nativa corrente sia >= alla richiesta
    return this.compareVersions(currentNative, requiredNative) >= 0;
  }

  private compareVersions(v1: string, v2: string): number {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const val1 = v1Parts[i] || 0;
      const val2 = v2Parts[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return -1;
    }
    return 0;
  }
}
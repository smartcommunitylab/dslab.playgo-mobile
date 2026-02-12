import { Injectable } from '@angular/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorHttp } from '@capacitor/core'; 
import { SplashScreen } from '@capacitor/splash-screen';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

interface UpdateManifestEntry {
  version: string;
  url: string;
  checksum: string;
  platform: string;
  app_version: string;
  flavor: string;
  timestamp: number;
}

export interface HotCodeUpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string | null;
  minNativeVersion: string | null;
  isNativeVersionTooOld: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AutoUpdateService {
  
  private readonly MANIFEST_URL = `${environment.serverUrl.azureBlobBaseUrl}/updates-manifest.json`;
  
  private hotCodeUpdateSubject = new BehaviorSubject<HotCodeUpdateStatus>({
    isChecking: false,
    isDownloading: false,
    hasUpdate: false,
    currentVersion: '0.0.0',
    latestVersion: null,
    minNativeVersion: null,
    isNativeVersionTooOld: false,
    error: null
  });
  
  public hotCodeUpdate$ = this.hotCodeUpdateSubject.asObservable();

  constructor() {}

  async init(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') return;
    
    if (!environment.useCodePush) {
      console.log('⚠️ CodePush disabilitato in questo environment');
      return;
    }

    try {
      await CapacitorUpdater.notifyAppReady();
      await this.checkForUpdate();
    } catch (e) { 
      console.error('❌ Init Update Error:', e); 
    }
  }

  async checkForUpdate(silent: boolean = true): Promise<void> {
    this.hotCodeUpdateSubject.next({
      ...this.hotCodeUpdateSubject.value,
      isChecking: true,
      error: null
    });

    try {
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

      const manifestUrl = `${this.MANIFEST_URL}?t=${Date.now()}`;
      const response = await CapacitorHttp.get({ url: manifestUrl });
      
      if (response.status !== 200 || !response.data) {
        throw new Error('Impossibile scaricare manifest');
      }

      let manifest: UpdateManifestEntry[];
      if (typeof response.data === 'string') {
        manifest = JSON.parse(response.data);
      } else if (Array.isArray(response.data)) {
        manifest = response.data;
      } else {
        throw new Error('Formato manifest non valido');
      }

      console.log(`📋 Manifest entries: ${manifest.length}`);
        
      const compatibleUpdates = manifest.filter(entry => 
        entry.platform === platform &&
        entry.flavor === flavor &&
        this.isNativeVersionCompatible(nativeVersion, entry.app_version)
      );

      if (compatibleUpdates.length === 0) {
        const allUpdates = manifest.filter(entry => 
          entry.platform === platform && entry.flavor === flavor
        );
        
        if (allUpdates.length > 0) {
          const latestUpdate = allUpdates.reduce((prev, current) => 
            this.compareVersions(current.version, prev.version) === 1 ? current : prev
          );
          
          const isNativeTooOld = this.compareVersions(nativeVersion, latestUpdate.app_version) < 0;
          
          this.hotCodeUpdateSubject.next({
            isChecking: false,
            isDownloading: false,
            hasUpdate: false,
            currentVersion: currentWebVersion,
            latestVersion: latestUpdate.version,
            minNativeVersion: latestUpdate.app_version,
            isNativeVersionTooOld: isNativeTooOld,
            error: null
          });
          
          console.log(`⚠️ Versione nativa troppo vecchia. Richiesta: ${latestUpdate.app_version}, Corrente: ${nativeVersion}`);
          return;
        }
        
        this.hotCodeUpdateSubject.next({
          ...this.hotCodeUpdateSubject.value,
          isChecking: false,
          hasUpdate: false
        });
        return;
      }

      const latestUpdate = compatibleUpdates.reduce((prev, current) => 
        this.compareVersions(current.version, prev.version) === 1 ? current : prev
      );

      console.log(`📡 Versione disponibile: v${latestUpdate.version}`);

      if (this.compareVersions(latestUpdate.version, currentWebVersion) === 1) {
        console.log('🚀 Nuova versione trovata! Inizio download...');

        this.hotCodeUpdateSubject.next({
          isChecking: false,
          isDownloading: true,
          hasUpdate: true,
          currentVersion: currentWebVersion,
          latestVersion: latestUpdate.version,
          minNativeVersion: latestUpdate.app_version,
          isNativeVersionTooOld: false,
          error: null
        });

        const update = await CapacitorUpdater.download({
          url: latestUpdate.url,
          version: latestUpdate.version,
          checksum: latestUpdate.checksum
        });
        
        if (update) {
          if (!silent) {
            SplashScreen.show();
          }
          await CapacitorUpdater.set(update);
          console.log('✅ Update installato!');
        }
      } else {
        this.hotCodeUpdateSubject.next({
          isChecking: false,
          isDownloading: false,
          hasUpdate: false,
          currentVersion: currentWebVersion,
          latestVersion: latestUpdate.version,
          minNativeVersion: latestUpdate.app_version,
          isNativeVersionTooOld: false,
          error: null
        });
      }

    } catch (error) {
      console.error('❌ Errore Update:', error);
      this.hotCodeUpdateSubject.next({
        ...this.hotCodeUpdateSubject.value,
        isChecking: false,
        isDownloading: false,
        error: error.message || 'Errore sconosciuto'
      });
    }
  }

  private isNativeVersionCompatible(currentNative: string, requiredNative: string): boolean {
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
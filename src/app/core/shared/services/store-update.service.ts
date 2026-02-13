import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { App } from '@capacitor/app';
import { environment } from 'src/environments/environment';

export interface StoreUpdateInfo {
  isChecking: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  storeVersion: string | null;
  isUpdateAvailable: boolean;
  updateUrl: string | null;
}

interface UpdateManifestEntry {
  version: string;
  url: string;
  checksum: string;
  platform: string;
  app_version: string; // Questa è la versione sullo store!
  flavor: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class StoreUpdateService {
  
  private readonly MANIFEST_URL = `${environment.serverUrl.azureBlobBaseUrl}/updates-manifest.json`;
  
  private storeUpdateSubject = new BehaviorSubject<StoreUpdateInfo>({
    isChecking: false,
    hasUpdate: false,
    currentVersion: '',
    storeVersion: null,
    isUpdateAvailable: false,
    updateUrl: null
  });
  
  public storeUpdate$ = this.storeUpdateSubject.asObservable();

  constructor() {}

  async checkStoreUpdate(): Promise<void> {
    console.log('🏪 StoreUpdateService: Starting check...');
    
    if (Capacitor.getPlatform() === 'web') {
      console.log('⚠️ StoreUpdateService: Web platform, skipping');
      return;
    }

    this.storeUpdateSubject.next({
      ...this.storeUpdateSubject.value,
      isChecking: true
    });

    try {
      const appInfo = await App.getInfo();
      const currentVersion = appInfo.version;
      const platform = Capacitor.getPlatform();
      const flavor = appInfo.id.includes('.stage') ? 'stage' : 'production';

      console.log('📱 StoreUpdateService: App info:', {
        currentVersion,
        platform,
        flavor,
        id: appInfo.id
      });

      // Scarica manifest
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

      // Filtra per platform e flavor
      const relevantUpdates = manifest.filter(entry => 
        entry.platform === platform && entry.flavor === flavor
      );

      if (relevantUpdates.length === 0) {
        console.log('⚠️ No updates found for this platform/flavor');
        this.storeUpdateSubject.next({
          ...this.storeUpdateSubject.value,
          isChecking: false
        });
        return;
      }

      // Trova l'entry più recente (quella con app_version più alta)
      const latestEntry = relevantUpdates.reduce((prev, current) => 
        this.compareVersions(current.app_version, prev.app_version) === 1 ? current : prev
      );

      // app_version è la versione sullo store
      const storeVersion = latestEntry.app_version;
      console.log('📊 StoreUpdateService: Latest store version in manifest:', storeVersion);

      // Confronta la versione corrente del dispositivo con quella sullo store
      const hasUpdate = this.compareVersions(storeVersion, currentVersion) === 1;

      console.log('✅ StoreUpdateService: Comparison result:', {
        storeVersion,
        currentVersion,
        hasUpdate
      });

      this.storeUpdateSubject.next({
        isChecking: false,
        hasUpdate: hasUpdate,
        currentVersion: currentVersion,
        storeVersion: storeVersion,
        isUpdateAvailable: hasUpdate,
        updateUrl: this.getStoreUrl(platform, appInfo.id)
      });

      console.log('📢 StoreUpdateService: Check completed');
      
    } catch (error) {
      console.error('❌ StoreUpdateService: Error:', error);
      this.storeUpdateSubject.next({
        ...this.storeUpdateSubject.value,
        isChecking: false
      });
    }
  }

  async openStore(): Promise<void> {
    console.log('🚀 Opening store...');
    const platform = Capacitor.getPlatform();
    const appInfo = await App.getInfo();
    const url = this.getStoreUrl(platform, appInfo.id);
    
    console.log('📲 Store URL:', url);
    
    if (url) {
      window.open(url, '_system');
    }
  }

  private getStoreUrl(platform?: string, appId?: string): string | null {
    const currentPlatform = platform || Capacitor.getPlatform();
    
    if (currentPlatform === 'ios') {
      // TODO: Replace with your actual iOS App Store ID
      return 'https://apps.apple.com/app/1641103495';
    } else if (currentPlatform === 'android') {
      const packageName =  'it.dslab.playgo';
      return `https://play.google.com/store/apps/details?id=${packageName}`;
    }
    return null;
  }

  private compareVersions(v1: string, v2: string): number {
    console.log(`🔢 Comparing versions: ${v1} vs ${v2}`);
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const val1 = v1Parts[i] || 0;
      const val2 = v2Parts[i] || 0;
      if (val1 > val2) {
        console.log(`✅ ${v1} > ${v2}`);
        return 1;
      }
      if (val1 < val2) {
        console.log(`⬇️ ${v1} < ${v2}`);
        return -1;
      }
    }
    console.log(`🟰 ${v1} = ${v2}`);
    return 0;
  }
}
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { App } from '@capacitor/app';
import { CapacitorHttp } from '@capacitor/core';

export interface StoreUpdateInfo {
  isChecking: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  storeVersion: string | null;
  isUpdateAvailable: boolean;
  updateUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class StoreUpdateService {
  
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

      console.log('📱 StoreUpdateService: App info:', {
        currentVersion,
        platform,
        id: appInfo.id,
        build: appInfo.build
      });

      let storeVersion: string | null = null;
      //TODO con url definitivi
      if (platform === 'android') {
        console.log('🤖 StoreUpdateService: Checking Google Play...');
        storeVersion = await this.checkGooglePlayVersion(appInfo.id);
      } else if (platform === 'ios') {
        console.log('🍎 StoreUpdateService: Checking App Store...');
        storeVersion = await this.checkAppStoreVersion(appInfo.id);
      }

      console.log('📊 StoreUpdateService: Store version:', storeVersion);

      const hasUpdate = storeVersion ? this.compareVersions(storeVersion, currentVersion) === 1 : false;

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

  private async checkGooglePlayVersion(packageName: string): Promise<string | null> {
    try {
      console.log('🔍 Checking Google Play for:', packageName);
      
      // TEMPORARY: Return hardcoded version for testing
      // TODO: Implement proper Google Play version check
      // Options:
      // 1. Use backend API that checks Google Play Store
      // 2. Use third-party service (unreliable)
      // 3. Manual configuration in Firebase Remote Config or similar
      
      return '1.5.9'; // REMOVE THIS LINE WHEN IMPLEMENTING REAL CHECK
      
      /* FUTURE IMPLEMENTATION:
      // Option 1: Backend API
      const response = await CapacitorHttp.get({
        url: `${environment.serverUrl.api}/app/latest-version?platform=android&package=${packageName}`
      });
      return response.data?.version || null;
      
      // Option 2: Scrape Play Store (not recommended, against TOS)
      // Not implemented
      
      // Option 3: Firebase Remote Config
      // Configure version in Firebase Console and fetch here
      */
      
    } catch (error) {
      console.error('❌ Error checking Google Play version:', error);
      return null;
    }
  }

  private async checkAppStoreVersion(bundleId: string): Promise<string | null> {
    try {
      console.log('🔍 Checking App Store for:', bundleId);
      
      // Use iTunes Lookup API (official Apple API)
      const response = await CapacitorHttp.get({
        url: `https://itunes.apple.com/lookup?bundleId=${bundleId}`
      });

      console.log('📥 App Store response:', response);

      if (response.status === 200 && response.data?.results?.length > 0) {
        const version = response.data.results[0].version;
        console.log('✅ App Store version found:', version);
        return version;
      }
      
      console.log('⚠️ No version found in App Store');
      return null;
    } catch (error) {
      console.error('❌ Error checking App Store version:', error);
      return null;
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
      // Find it in App Store Connect
      return 'https://apps.apple.com/app/id6670234191';
    } else if (currentPlatform === 'android') {
      const packageName = appId || 'it.dslab.playgo.stage';
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
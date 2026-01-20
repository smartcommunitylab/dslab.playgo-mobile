import { Injectable } from '@angular/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorHttp } from '@capacitor/core'; 
import { environment } from 'src/environments/environment';
import { SplashScreen } from '@capacitor/splash-screen'

@Injectable({ providedIn: 'root' })
export class AutoUpdateService {

  constructor() {} // Niente HttpClient iniettato qui o usato sotto!

  async init(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await CapacitorUpdater.notifyAppReady();
      await this.checkForUpdate();
    } catch (e) { console.error(e); }
  }

  async checkForUpdate(): Promise<void> {
    try {
      const url = `${environment.serverUrl.supabaseUrl}/rest/v1/rpc/check_update`;
      const key = environment.serverUrl.supabaseAnonKey;
      
      // 1. Dati Nativi
      const appInfo = await App.getInfo();
      const nativeVersion = appInfo.version; // Es: 1.0.0
      const appId = appInfo.id;
      const channel = appId.includes('.stage') ? 'Staging' : 'Production';

      // 2. Dati Web Attuali
      const currentBundle = await CapacitorUpdater.current();
      const currentWebVersion = (currentBundle.bundle.version === 'builtin' || !currentBundle.bundle.version) 
                                ? '0.0.0' : currentBundle.bundle.version;

      console.log(`🔍 Check Update | Nativa: ${nativeVersion} | Web: ${currentWebVersion}`);

      // 3. Chiamata al Server (Passando native_version!)
      const response = await CapacitorHttp.post({
        url: url,
        headers: { 
          'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' 
        },
        data: { 
          app_id: appId, 
          channel_name: channel,
          native_version: nativeVersion 
        }
      });

      if (response.status !== 200 || !response.data || !response.data.version) {
        console.log('✅ Nessun aggiornamento disponibile.');
        return;
      }

      const serverData = response.data;
      console.log(`📡 Server propone: v${serverData.version}`);

      // 4. Confronto Matematico (Scarica solo se Server > Corrente)
      if (this.compareVersions(serverData.version, currentWebVersion) === 1) {
        
        console.log('🚀 Nuova versione trovata! Inizio download...');

        // Fix Localhost/Ngrok
        let finalUrl = serverData.url;
// --- FIX 1: GESTIONE PATH RELATIVO (Il tuo errore attuale "no protocol") ---
        // Se l'URL non inizia con http, significa che è un path interno di Supabase Storage.
        // Dobbiamo costruirgli l'indirizzo completo.
        if (!finalUrl.startsWith('http')) {
          // Rimuoviamo eventuali slash finali dall'URL base per pulizia
          const baseUrl = environment.serverUrl.supabaseUrl.replace(/\/$/, '');
          // Rimuoviamo eventuali slash iniziali dal path
          const path = finalUrl.replace(/^\//, '');
          
          // Costruzione URL Supabase Storage standard:
          // BASE_URL + /storage/v1/object/public/ + BUCKET_AND_PATH
          finalUrl = `${baseUrl}/storage/v1/object/public/${path}`;
      }

      // --- FIX 2: GESTIONE LOCALHOST (Il tuo fix precedente) ---
      if (finalUrl.includes('localhost')) {
         finalUrl = finalUrl.replace('http://localhost:8000', environment.serverUrl.supabaseUrl);
      }

      console.log(`⬇️ Download da URL Definitivo: ${finalUrl}`);

        const update = await CapacitorUpdater.download({
          url: finalUrl,
          version: serverData.version,
          checksum: serverData.checksum
        });
        
        if ( update) {
          // Activate the update when the application is sent to background
          SplashScreen.show()
          try {
            await CapacitorUpdater.set(update);
            // At this point, the new version should be active, and will need to hide the splash screen
          } catch (error) {
            SplashScreen.hide() // Hide the splash screen again if something went wrong
          }
        }
      } else {
        console.log('✅ Versione già aggiornata.');
      }

    } catch (error) {
      console.error('❌ Errore Update:', error);
    }
  }

  // Funzione Helper
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
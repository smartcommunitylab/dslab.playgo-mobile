import { StorageBackend } from '@openid/appauth';

export class TemporaryStorageBackend implements StorageBackend {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    // Prima prova dalla Map in memoria
    let value = this.storage.get(key) || null;
    
    // Se non trovato, prova da sessionStorage (backup dopo redirect)
    if (!value) {
      const sessionValue = sessionStorage.getItem(`temp_storage_${key}`);
      if (sessionValue) {
        console.log('[TempStorage] Restored from sessionStorage:', key);
        value = sessionValue;
        this.storage.set(key, sessionValue); // Ripristina in memoria
      }
    }
    
    console.log('[TempStorage] getItem:', { 
      key, 
      hasValue: !!value,
      valueLength: value?.length || 0,
      preview: value?.substring(0, 50) 
    });
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log('[TempStorage] setItem:', { 
      key, 
      valueLength: value.length,
      preview: value.substring(0, 50) + '...'
    });
    this.storage.set(key, value);
    
    // Salva anche in sessionStorage come backup per sopravvivere al redirect
    sessionStorage.setItem(`temp_storage_${key}`, value);
    
    // Verifica che sia stato salvato
    const saved = this.storage.get(key);
    console.log('[TempStorage] setItem verification:', { 
      key, 
      saved: saved === value,
      alsoInSession: !!sessionStorage.getItem(`temp_storage_${key}`)
    });
  }

  async removeItem(key: string): Promise<void> {
    console.log('[TempStorage] removeItem:', key);
    this.storage.delete(key);
    sessionStorage.removeItem(`temp_storage_${key}`);
  }

  async clear(): Promise<void> {
    console.log('[TempStorage] clear - keys before:', Array.from(this.storage.keys()));
    this.storage.clear();
    // Rimuovi tutti i temp_storage_* da sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('temp_storage_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Debug helper
  dumpStorage(): void {
    console.log('[TempStorage] Current storage:', {
      size: this.storage.size,
      keys: Array.from(this.storage.keys()),
      sessionKeys: Object.keys(sessionStorage).filter(k => k.startsWith('temp_storage_'))
    });
  }
}
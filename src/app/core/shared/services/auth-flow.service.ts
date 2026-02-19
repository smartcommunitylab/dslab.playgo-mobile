import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService, Browser, IAuthConfig } from 'ionic-appauth';
import { App } from '@capacitor/app';
import { Requestor } from '@openid/appauth';
import { SpinnerService } from './spinner.service';
import { environment } from 'src/environments/environment';
import { TemporaryStorageBackend } from '../../auth/temporary-storage';
import { firstValueFrom } from 'rxjs';
import { filter, timeout } from 'rxjs/operators';

export interface CampaignAuthConfig {
  authUrl: string;
  clientId: string;
  scopes: string;
  clientSecret?: string;
}

const TEMP_AUTH_CONFIG_KEY = 'temp_auth_config';

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private tempAuthService: AuthService | null = null;
  private tempStorage: TemporaryStorageBackend | null = null;
  private tempAuthState: string | null = null;

  constructor(
    private platform: Platform,
    private ngZone: NgZone,
    private requestor: Requestor,
    private browser: Browser,
    private spinnerService: SpinnerService
  ) {}

  private getRedirectUri(): string {
    const isNative = this.platform.is('capacitor') || this.platform.is('hybrid');
    
    if (isNative) {
      const suffix = environment.name !== 'prod' ? `.${environment.name}` : '';
      return `it.dslab.playgo${suffix}://auth/callback`;
    } else {
      return `${window.location.origin}/auth/callback`;
    }
  }

  /**
   * Pulisce COMPLETAMENTE lo stato temporaneo
   */
  async clearTemporaryAuth(): Promise<void> {
    console.log('🧹 Clearing temporary auth...');
    
    if (this.tempStorage) {
      await this.tempStorage.clear();
      this.tempStorage = null;
    }
    
    this.tempAuthService = null;
    this.tempAuthState = null;
    
    // Pulisci sessionStorage (TRANNE pending_campaign_id!)
    sessionStorage.removeItem('temp_auth_state');
    sessionStorage.removeItem(TEMP_AUTH_CONFIG_KEY);
    
    // Pulisci tutti i temp_storage_*
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('temp_storage_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('✅ Temporary auth cleared');
  }

  /**
   * Ripristina tempAuthService da sessionStorage (dopo redirect)
   */
  private async restoreTempAuthService(): Promise<void> {
    const savedConfig = sessionStorage.getItem(TEMP_AUTH_CONFIG_KEY);
    const savedState = sessionStorage.getItem('temp_auth_state');
    
    console.log('🔄 Restoring temp auth service...');
    console.log('Has config:', !!savedConfig);
    console.log('Has state:', !!savedState);
    
    if (!savedConfig || !savedState) {
      console.warn('❌ Cannot restore: missing config or state');
      return;
    }
    
    try {
      const config: CampaignAuthConfig & { redirectUrl: string } = JSON.parse(savedConfig);
      
      // Ricrea storage e service
      this.tempStorage = new TemporaryStorageBackend();
      this.tempAuthService = new AuthService(
        this.browser,
        this.tempStorage,
        this.requestor
      );
      
      this.tempAuthState = savedState;
      
      // Configura
      this.tempAuthService.authConfig = {
        client_id: config.clientId,
        server_host: config.authUrl,
        redirect_url: config.redirectUrl,
        end_session_redirect_url: config.redirectUrl,
        scopes: config.scopes,
        pkce: true,
        client_secret: config.clientSecret,
      };
      
      await this.tempAuthService.init();
      console.log('✅ Temp auth service restored');
      
    } catch (error) {
      console.error('❌ Error restoring temp auth service:', error);
      await this.clearTemporaryAuth();
    }
  }

  /**
   * Avvia autenticazione temporanea
   */
  async startAuthForCampaign(config: CampaignAuthConfig): Promise<string> {
    console.log('🚀 Starting auth for campaign...');
    
    // Pulisci stato precedente (TRANNE pending_campaign_id)
    await this.clearTemporaryAuth();
    
    const redirectUrl = this.getRedirectUri();
    this.tempAuthState = `temp_${Math.random().toString(36).substr(2, 9)}`;
    
    // Salva config e state
    sessionStorage.setItem('temp_auth_state', this.tempAuthState);
    sessionStorage.setItem(TEMP_AUTH_CONFIG_KEY, JSON.stringify({
      ...config,
      redirectUrl
    }));
    
    // Crea nuovo storage e service
    this.tempStorage = new TemporaryStorageBackend();
    this.tempAuthService = new AuthService(
      this.browser,
      this.tempStorage,
      this.requestor
    );
    
    this.tempAuthService.authConfig = {
      client_id: config.clientId,
      server_host: config.authUrl,
      redirect_url: redirectUrl,
      end_session_redirect_url: redirectUrl,
      scopes: config.scopes,
      pkce: true,
      client_secret: config.clientSecret,
    };
    
    // Setup listener mobile
    const isNative = this.platform.is('capacitor') || this.platform.is('hybrid');
    if (isNative) {
      console.log('📱 Setting up mobile listener...');
      await App.removeAllListeners();
      
      App.addListener('appUrlOpen', (data: any) => {
        if (data?.url && data.url.includes('auth/callback')) {
          const url = new URL(data.url);
          const state = url.searchParams.get('state');
          
          if (state === this.tempAuthState) {
            console.log('✅ Mobile callback received');
            this.ngZone.run(() => {
              this.tempAuthService?.authorizationCallback(data.url);
            });
          }
        }
      });
    }
    
    await this.tempAuthService.init();
    
    // Aspetta token
    const tokenPromise = firstValueFrom(
      this.tempAuthService.token$.pipe(
        filter(token => !!token?.accessToken),
        timeout(120_000)
      )
    );
    
    console.log('🔐 Starting sign in...');
    await this.tempAuthService.signIn({ prompt: 'login' }, this.tempAuthState);
    
    const token = await tokenPromise;
    console.log('✅ Token received');
    
    if (!token?.accessToken) {
      throw new Error('No access token');
    }
    
    return token.accessToken;
  }

  /**
   * Gestisce callback (solo WEB, chiamato da auth-callback.page)
   */
  async handleTemporaryAuthCallback(url: string): Promise<void> {
    console.log('🌐 Handling web callback...');
    
    // Ripristina service da sessionStorage
    if (!this.tempAuthService) {
      await this.restoreTempAuthService();
    }
    
    if (!this.tempAuthService) {
      console.error('❌ Cannot restore tempAuthService');
      return;
    }
    
    // Processa callback
    this.tempAuthService.authorizationCallback(url);
    console.log('✅ Callback processed');
  }

  /**
   * Recupera token corrente
   */
  async getTemporaryToken(): Promise<string | undefined> {
    console.log('🔍 Getting temporary token...');
    
    // Ripristina service se necessario
    if (!this.tempAuthService) {
      await this.restoreTempAuthService();
    }
    
    if (!this.tempAuthService) {
      console.warn('⚠️ No tempAuthService available');
      return undefined;
    }
    
    try {
      const token = await firstValueFrom(
        this.tempAuthService.token$.pipe(
          filter(token => !!token?.accessToken),
          timeout(5000)
        )
      );
      
      console.log('✅ Token retrieved');
      return token?.accessToken;
    } catch (error) {
      console.warn('⚠️ No token available:', error);
      return undefined;
    }
  }
}
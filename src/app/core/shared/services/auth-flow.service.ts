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

// Chiave per salvare config in sessionStorage
const TEMP_AUTH_CONFIG_KEY = 'temp_auth_config';

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private tempAuthService: AuthService | null = null;
  private tempStorage: TemporaryStorageBackend | null = null;
  private tempAuthState: string | null = null;

//   private readonly AAC_BASE_URL = 'https://aac.platform.smartcommunitylab.it';

  constructor(
    private platform: Platform,
    private ngZone: NgZone,
    private requestor: Requestor,
    private browser: Browser,
    private spinnerService: SpinnerService
  ) {
    // Ricrea il servizio se c'è una config salvata (dopo redirect)
    this.restoreTempAuthServiceIfNeeded();
  }

  private getRedirectUri(): string {
    const isNative = this.platform.is('capacitor') || this.platform.is('hybrid');
    
    if (isNative) {
      const suffix = environment.name !== 'prod' ? `.${environment.name}` : '';
      return `it.dslab.playgo${suffix}://auth/callback`;
    } else {
      const origin = window.location.origin;
      return `${origin}/auth/callback`;
    }
  }

  /**
 * Ripristina tempAuthService se c'è una sessione OAuth in corso
 */
private restoreTempAuthServiceIfNeeded(): void {
    const savedConfig = sessionStorage.getItem(TEMP_AUTH_CONFIG_KEY);
    const savedState = sessionStorage.getItem('temp_auth_state');
    
    console.log('restoreTempAuthServiceIfNeeded START');
    console.log('savedConfig:', !!savedConfig);
    console.log('savedState:', savedState);
    
    if (savedConfig && savedState) {
      console.log('Restoring temp auth service from session');
      
      try {
        const config: CampaignAuthConfig & { redirectUrl: string } = JSON.parse(savedConfig);
        console.log('Parsed config:', {
          clientId: config.clientId,
          scopes: config.scopes,
          redirectUrl: config.redirectUrl,
          hasClientSecret: !!config.clientSecret,
        });
        
        // Ricrea storage e service
        this.tempStorage = new TemporaryStorageBackend();
        console.log('TemporaryStorageBackend created');
        
        this.tempAuthService = new AuthService(
          this.browser,
          this.tempStorage,
          this.requestor
        );
        console.log('AuthService created');
  
        this.tempAuthState = savedState;
  
        // Riconfigura
        const tempConfig: IAuthConfig = {
          client_id: config.clientId,
          server_host: config.authUrl,
          redirect_url: config.redirectUrl,
          end_session_redirect_url: config.redirectUrl,
          scopes: config.scopes,
          pkce: true,
          client_secret: config.clientSecret,
        };
  
        this.tempAuthService.authConfig = tempConfig;
        console.log('AuthConfig set:', tempConfig);
        
        // IMPORTANTE: Inizializza il servizio
        this.tempAuthService.init().then(() => {
          console.log('tempAuthService initialized successfully');
        }).catch(err => {
          console.error('tempAuthService init error:', err);
        });
        
      } catch (error) {
        console.error('Error restoring tempAuthService:', error);
      }
    } else {
      console.log('No saved config or state found, skipping restore');
    }
    
    console.log('restoreTempAuthServiceIfNeeded END');
  }

  /**
   * Avvia autenticazione temporanea per una campagna
   */
  async startAuthForCampaign(config: CampaignAuthConfig): Promise<string> {
    const redirectUrl = this.getRedirectUri();
    this.tempAuthState = `temp_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('=== startAuthForCampaign START ===');
    console.log('redirectUrl:', redirectUrl);
    console.log('tempAuthState:', this.tempAuthState);
    
    // Salva config e state in sessionStorage (sopravvive al redirect)
    sessionStorage.setItem('temp_auth_state', this.tempAuthState);
    sessionStorage.setItem(TEMP_AUTH_CONFIG_KEY, JSON.stringify({
      ...config,
      redirectUrl
    }));

    this.tempStorage = new TemporaryStorageBackend();
    this.tempAuthService = new AuthService(
      this.browser,
      this.tempStorage,
      this.requestor
    );

    this.browser.browserCloseListener(() => {
      try {
        this.spinnerService.hide('login');
      } catch (e) {
        console.warn('Browser close error', e);
      }
    });

    const tempConfig: IAuthConfig = {
      client_id: config.clientId,
      server_host: config.authUrl,
      redirect_url: redirectUrl,
      end_session_redirect_url: redirectUrl,
      scopes: config.scopes,
      pkce: true,
      client_secret: config.clientSecret,
    };

    this.tempAuthService.authConfig = tempConfig;

    // Setup listener per callback su app native
    const isNative = this.platform.is('capacitor') || this.platform.is('hybrid');
    if (isNative) {
        console.log('Setting up native App listener');
    // Rimuovi listener precedenti se esistono
    await App.removeAllListeners();

      App.addListener('appUrlOpen', (data: any) => {
        console.log('=== App URL Open Event ===');
        console.log('URL received:', data?.url);
       
        if (data?.url && data.url.indexOf(redirectUrl) === 0) {
          const url = new URL(data.url);
          const state = url.searchParams.get('state');
          console.log('State from URL:', state);
          console.log('Expected state:', this.tempAuthState);
       
          if (state === this.tempAuthState) {
            console.log('State matches! Processing callback...');

            this.ngZone.run(() => {
              this.tempAuthService?.authorizationCallback(data.url);
            });
          }else {
            console.warn('State mismatch!');
          }} else {
            console.log('URL does not match redirect URL');
          
        }
      });
    }

    await this.tempAuthService.init();

    // Aspetta il token PRIMA di chiamare signIn
    const tokenPromise = firstValueFrom(
        this.tempAuthService.token$.pipe(
            filter(token => {
              console.log('Token received:', !!token?.accessToken);
              return !!token?.accessToken;
            }),
            timeout(120_000) // 2 minuti
          )
    );

    // Avvia signin
    console.log('Starting signIn...');
    await this.tempAuthService.signIn(undefined, this.tempAuthState);

    // Aspetta che il token arrivi
    const token = await tokenPromise;
    console.log('Token received successfully');

    if (!token?.accessToken) {
      throw new Error('No access token received');
    }

    return token.accessToken;
  }

 /**
 * Gestisce callback OAuth temporaneo
 */
handleTemporaryAuthCallback(url: string): void {
    console.log('=== handleTemporaryAuthCallback START ===');
    console.log('URL:', url);
    console.log('tempAuthService exists:', !!this.tempAuthService);
    
    if (!this.tempAuthService) {
      console.log('Attempting to restore tempAuthService...');
      this.restoreTempAuthServiceIfNeeded();
    }
  
    if (this.tempAuthService) {
      console.log('tempAuthService restored/available');
      console.log('tempAuthService.authConfig:', this.tempAuthService.authConfig);
      
      // Sottoscrivi PRIMA di chiamare authorizationCallback
      const sub = this.tempAuthService.token$.subscribe({
        next: (token) => {
          console.log('Token update received:', {
            hasToken: !!token,
            hasAccessToken: !!token?.accessToken,
            tokenType: token?.tokenType
          });
          
          if (token?.accessToken) {
            console.log('Access token (first 30 chars):', token.accessToken.substring(0, 30) + '...');
          }
        },
        error: (err) => {
          console.error('Token$ error:', err);
        },
        complete: () => {
          console.log('Token$ completed');
        }
      });
      
      // Chiama il callback
      console.log('Calling authorizationCallback with URL:', url);
      
      try {
        this.tempAuthService.authorizationCallback(url);
        console.log('authorizationCallback called successfully');
      } catch (error) {
        console.error('authorizationCallback threw error:', error);
      }
    } else {
      console.error('No tempAuthService available even after restore attempt');
    }
    
    console.log('=== handleTemporaryAuthCallback END ===');
  }

  /**
   * Pulisce il token temporaneo dopo l'uso
   */
  async clearTemporaryAuth(): Promise<void> {
    if (this.tempStorage) {
      await this.tempStorage.clear();
      this.tempStorage = null;
    }
    this.tempAuthService = null;
    this.tempAuthState = null;
    
    // Pulisci sessionStorage
    sessionStorage.removeItem('temp_auth_state');
    sessionStorage.removeItem(TEMP_AUTH_CONFIG_KEY);
  }
  async getTemporaryToken(): Promise<string | undefined> {
    if (this.tempAuthService) {
        const token = await firstValueFrom(
            this.tempAuthService.token$.pipe(
              filter(token => {
                console.log('Token received in observable:', !!token?.accessToken);
                return !!token?.accessToken;
              }),
              timeout(30_000) // 30 secondi
            )
      ).catch(() => undefined);
      
      return token?.accessToken;
    }
    return undefined;
  }
}
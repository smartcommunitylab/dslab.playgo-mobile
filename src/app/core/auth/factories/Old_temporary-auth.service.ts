import { Injectable } from '@angular/core';
import { AuthService, DefaultBrowser, IAuthConfig } from 'ionic-appauth';
import { environment } from 'src/environments/environment';
import { JQueryRequestor } from '@openid/appauth';
import { TemporaryStorageBackend } from '../temporary-storage';

@Injectable({
  providedIn: 'root',
})
export class AuthFlowService {
  private tempAuthService: AuthService | null = null;

  constructor() {}

  // ... metodi esistenti (getAuthServiceForProvider, startAuthFlow, etc.) ...

  /**
   * Avvia un flusso di autenticazione temporaneo per una campagna specifica
   * NON sovrascrive il token principale
   * 
   * @param campaignAuthConfig - Configurazione OAuth dalla campagna (specificData)
   * @returns Promise<string> - Access token temporaneo
   */
  async startAuthForCampaign(campaignAuthConfig: {
    clientId: string;
    scopes: string;
    issuer: string;
    redirectUrl?: string;
    clientSecret?: string;
  }): Promise<string> {
    // Crea un AuthService isolato con storage temporaneo
    this.tempAuthService = new AuthService(
      new DefaultBrowser(),
      new TemporaryStorageBackend(), // <-- storage separato!
      new JQueryRequestor()
    );

    const tempConfig: IAuthConfig = {
      client_id: campaignAuthConfig.clientId,
      server_host: campaignAuthConfig.issuer,
      redirect_url: campaignAuthConfig.redirectUrl || 'it.dslab.playgo://temp-auth',
      end_session_redirect_url: campaignAuthConfig.redirectUrl || 'it.dslab.playgo://temp-auth',
      scopes: campaignAuthConfig.scopes,
      pkce: true,
      client_secret: campaignAuthConfig.clientSecret,
    };

    this.tempAuthService.authConfig = tempConfig;
    await this.tempAuthService.init();

    // Avvia il flusso OAuth (apre browser in-app)
    await this.tempAuthService.signIn();

    // Attendi il token (viene settato dopo il callback)
    return new Promise((resolve, reject) => {
      const sub = this.tempAuthService!.token$.subscribe((token) => {
        if (token && token.accessToken) {
          sub.unsubscribe();
          resolve(token.accessToken);
        }
      });

      // Timeout 2 minuti
      setTimeout(() => {
        sub.unsubscribe();
        reject(new Error('Temporary auth timeout'));
      }, 120_000);
    });
  }

  /**
   * Gestisce il callback OAuth temporaneo (chiamato dal deep-link handler)
   */
  handleTemporaryAuthCallback(url: string): void {
    if (this.tempAuthService) {
      this.tempAuthService.authorizationCallback(url);
    }
  }

  /**
   * Pulisce il token temporaneo dopo l'uso
   */
  async clearTemporaryAuth(): Promise<void> {
    if (this.tempAuthService) {
      await this.tempAuthService.endSessionCallback();
      this.tempAuthService = null;
    }
  }
}
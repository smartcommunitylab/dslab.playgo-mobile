import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthFlowService } from 'src/app/core/shared/services/auth-flow.service';

@Component({
  templateUrl: './auth-callback.page.html',
  standalone: false
})
export class AuthCallbackPage implements OnInit {
  constructor(
    private authService: AuthService,
    private authFlowService: AuthFlowService,
    private router: Router
  ) {}

  ngOnInit() {
    const url = window.location.href;
    const urlObj = new URL(url);
    const state = urlObj.searchParams.get('state');
    const isTempCallback = state?.startsWith('temp_');
  
    if (!isPlatform('capacitor')) {
      if (isTempCallback) {
        console.log('Processing temporary callback');
        this.authFlowService.handleTemporaryAuthCallback(url);
        
        // Recupera l'ID della campagna salvato
        const campaignId = sessionStorage.getItem('pending_campaign_id');
        
        if (campaignId) {
          // Segnala successo
          sessionStorage.setItem('temp_auth_success', 'true');
          
          // Naviga alla pagina specifica della campagna
          setTimeout(() => {
            this.router.navigate(['/pages/tabs/campaigns/join', campaignId]);
          }, 1500);
        } else {
          // Fallback: vai alla lista campagne
          console.warn('No campaign ID found, navigating to campaigns list');
          setTimeout(() => {
            this.router.navigate(['/pages/tabs/campaigns']);
          }, 1500);
        }
      } else {
        // Callback login principale
        this.authService.authorizationCallback();
        setTimeout(() => {
          this.router.navigate(['/pages/tabs/home']);
        }, 1000);
      }
    } else {
      // Native callback
      if (isTempCallback) {
        this.authFlowService.handleTemporaryAuthCallback(url);
      } else {
        this.authService.authorizationCallback();
        setTimeout(() => {
          this.router.navigate(['/pages/tabs/home']);
        }, 500);
      }
    }
  }
}
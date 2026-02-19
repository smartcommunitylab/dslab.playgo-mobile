import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthFlowService } from 'src/app/core/shared/services/auth-flow.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.page.html',
  standalone: false,
})
export class AuthCallbackPage implements OnInit {
  constructor(
    private authService: AuthService,
    private authFlowService: AuthFlowService,
    private router: Router
  ) {}

  async ngOnInit() {
    // SOLO SU WEB (mobile usa app.component deep link)
    if (isPlatform('capacitor')) {
      console.log('Mobile: callback handled by app.component');
      return;
    }

    const url = window.location.href;
    const urlObj = new URL(url);
    const state = urlObj.searchParams.get('state');
    const isTempCallback = state?.startsWith('temp_');

    console.log('🌐 Web callback:', { url, state, isTempCallback });

    if (isTempCallback) {
      // Callback temporaneo campagna
      console.log('Processing temp callback...');
      await this.authFlowService.handleTemporaryAuthCallback(url);

      const campaignId = sessionStorage.getItem('pending_campaign_id');
      console.log('pending_campaign_id:', campaignId);

      // Naviga alla campagna
      setTimeout(() => {
        if (campaignId) {
          this.router.navigate(['/pages/tabs/campaigns/join', campaignId]);
        } else {
          this.router.navigate(['/pages/tabs/campaigns']);
        }
      }, 1000);
    } else {
      // Callback login principale
      console.log('Processing main callback...');
      this.authService.authorizationCallback();

      setTimeout(() => {
        this.router.navigate(['/pages/tabs/home']);
      }, 1000);
    }
  }
}
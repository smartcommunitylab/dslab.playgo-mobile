import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-campaign-auth-callback',
  template: '<p>Completing authentication...</p>',
  standalone: false,
})
export class CampaignAuthCallbackPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        this.router.navigateByUrl('/pages/tabs/campaigns');
      }
    }, 500);
  }
}
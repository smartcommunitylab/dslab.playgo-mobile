import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  templateUrl: './auth-callback.page.html',
})
export class AuthCallbackPage implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.authorizationCallback();
  }
}

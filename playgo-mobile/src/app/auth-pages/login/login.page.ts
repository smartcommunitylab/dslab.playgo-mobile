import { Component } from '@angular/core';
import { AuthProvider, AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  constructor(private authService: AuthService) {}

  public signIn(provider?: AuthProvider) {
    this.authService.login(provider);
  }
}

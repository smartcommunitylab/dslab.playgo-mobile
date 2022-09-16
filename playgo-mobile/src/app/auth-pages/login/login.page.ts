import { Component } from '@angular/core';
import { AuthProvider, AuthService } from 'src/app/core/auth/auth.service';
import { SpinnerService } from 'src/app/core/shared/services/spinner.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {}

  public signIn(provider?: AuthProvider) {
    this.spinnerService.show('login', 30_000);
    this.authService.login(provider);
  }
}

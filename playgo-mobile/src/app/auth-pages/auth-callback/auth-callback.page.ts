import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/shared/services/user.service';
import { takeUntil } from 'rxjs/operators';
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

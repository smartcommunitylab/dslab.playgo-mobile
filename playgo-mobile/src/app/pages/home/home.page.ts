import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private errorService: ErrorService
  ) {
    this.pushInit();
  }

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  showNotifications() {
    this.router.navigateByUrl('/pages/notifications');
  }
  ngOnInit() {}

  ngOnDestroy() {}
  pushInit() {
    this.authService.isReadyForApi$.subscribe(() => {
      // console.log('Initializing HomePage');

      //init push notification setup after login
      try {
        this.notificationService.initPush();
      } catch (error) {
        this.errorService.handleError(error, 'silent');
      }
    });
  }
}

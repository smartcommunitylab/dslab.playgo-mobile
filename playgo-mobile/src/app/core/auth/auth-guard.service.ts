import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../shared/services/user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private navCtrl: NavController
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.isAuthenticated$.pipe(
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.authService.logout();
        }
        if (isAuthenticated) {
          this.userService.isUserRegistered().then((isRegistered) => {
            if (isRegistered === false) {
              this.navCtrl.navigateRoot('/pages/registration');
            }
          });
        }
      })
    );
  }
}

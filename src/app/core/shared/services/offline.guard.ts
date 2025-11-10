import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { isOffline } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class OfflineGuard implements CanActivateChild, CanActivate {
  constructor(private router: Router) {}
  public canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.navigateToOfflinePageIfNeeded(childRoute);
  }
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.navigateToOfflinePageIfNeeded(route);
  }
  private navigateToOfflinePageIfNeeded(
    route: ActivatedRouteSnapshot
  ): boolean | UrlTree {
    if (!route.component) {
      return true;
    }
    if (route.data.isOfflinePage === true) {
      return true;
    }
    if (isOffline()) {
      return this.router.parseUrl('/pages/tabs/offline');
    }
    return true;
  }
}

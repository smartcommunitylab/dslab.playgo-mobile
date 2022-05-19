import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'ionic-appauth';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { NavController } from '@ionic/angular';
// import { UserService } from '../shared/services/user.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private urlsToNotUse: Array<string>;
  private isRefreshing = false;
  private refreshTokenSubject: ReplaySubject<any> = new ReplaySubject<any>(
    null
  );
  public refreshToken$: Observable<string> =
    this.refreshTokenSubject.asObservable();
  constructor(
    private authService: AuthService,
    //private userService: UserService
    private localStorageService: LocalStorageService,
    private navCtrl: NavController
  ) {
    this.urlsToNotUse = [];
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (this.isValidRequestForInterceptor(req.url)) {
      return from(this.handle(req, next));
    }
    return next.handle(req);
  }
  async handle(req: HttpRequest<any>, next: HttpHandler) {
    const token = await this.authService.getValidToken();
    if (token) {
      // If we have a token, we set it to the header
      req = req.clone({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        setHeaders: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `${token.tokenType === 'bearer' ? 'Bearer' : token.tokenType
            } ${token.accessToken}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: '*/*',
        },
      });
      //req = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token.accessToken}`) });
    }
    return next
      .handle(req)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return this.handle401Error(req, next);
          }
          return throwError(error);
        })
      )
      .toPromise();
  }
  private async handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      try {
        const token = await this.authService.getValidToken();
        if (token) {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          //change token to request
          request = this.changeToken(token.accessToken, request);
          return next.handle(request);
        } else {
          this.isRefreshing = false;
          //logout
          //this.userService.logout();
          this.authService.signOut();
          this.localStorageService.clearUser();
          this.navCtrl.navigateRoot('login');
        }
      } catch (e) {
        this.isRefreshing = false;
        return throwError(e);
      }
    }
  }
  changeToken(accessToken: string, request: HttpRequest<any>) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }
  private isValidRequestForInterceptor(requestUrl: string): boolean {
    if (requestUrl.indexOf('/userinfo') > 0) {
      return true;
    }
    const positionIndicator = 'playandgo/api/';
    const position = requestUrl.indexOf(positionIndicator);
    if (position > 0) {
      const destination: string = requestUrl.substr(
        position + positionIndicator.length
      );
      for (const address of this.urlsToNotUse) {
        if (new RegExp(address).test(destination)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}

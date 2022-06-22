import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import {
  BehaviorSubject,
  from,
  Observable,
  ReplaySubject,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  finalize,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { AuthService } from 'ionic-appauth';
import { SpinnerService } from '../shared/services/spinner.service';
import { tapLog } from '../shared/utils';
import { UserService } from '../shared/services/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private urlsToNotUse: Array<string>;
  private isRefreshing = false;
  private tokenRefreshed$ = new BehaviorSubject<boolean>(false);

  private refreshTokenSubject: ReplaySubject<any> = new ReplaySubject<any>(
    null
  );
  public refreshToken$: Observable<string> =
    this.refreshTokenSubject.asObservable();
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private spinnerService: SpinnerService
  ) {
    this.urlsToNotUse = [];
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isValidRequestForInterceptor(req.url)) {
      this.spinnerService.show();
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
          Authorization: `${
            token.tokenType === 'bearer' ? 'Bearer' : token.tokenType
          } ${token.accessToken}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: '*/*',
        },
      });
    }
    return next
      .handle(req)
      .pipe(
        catchError(
          (error: HttpErrorResponse) => throwError(error)
          // if (error instanceof HttpErrorResponse && error.status === 401) {
          //   return this.handle401Error(req, next);
          // }
        ),
        finalize(() => {
          this.spinnerService.hide();
        })
      )
      .toPromise();
  }

  // private handle401Error(
  //   request: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   if (this.isRefreshing) {
  //     return this.tokenRefreshed$.pipe(
  //       filter(Boolean),
  //       take(1),
  //       concatMap(async () => {
  //         const token = await this.authService.getValidToken();
  //         return next.handle(this.changeToken(token.accessToken, request));
  //       }),
  //       concatMap((x) => x)
  //     );
  //   }

  //   this.isRefreshing = true;

  //   // Reset here so that the following requests wait until the token
  //   // comes back from the refreshToken call.
  //   this.tokenRefreshed$.next(false);
  //   return this.authService.token$.pipe(
  //     // tap(() => this.authService.refreshToken()),
  //     switchMap(async (res) => {
  //       const token = await this.authService.getValidToken();
  //       this.tokenRefreshed$.next(true);
  //       this.refreshTokenSubject.next(token.accessToken);
  //       return next.handle(this.changeToken(token.accessToken, request));
  //     }),
  //     concatMap((x) => x),
  //     catchError((err) => {
  //       this.userService.logout();
  //       return throwError(err);
  //     }),
  //     finalize(() => {
  //       this.spinnerService.hide();
  //       this.isRefreshing = false;
  //     })
  //   );
  // }
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

import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { defer, Observable, throwError } from 'rxjs';
import {
  catchError,
  concatMap,
  finalize,
  take,
  share,
  tap,
} from 'rxjs/operators';
import { SpinnerService } from '../shared/services/spinner.service';
import { tapLog } from '../shared/utils';
import { UserService } from '../shared/services/user.service';
import { TokenResponse } from '@openid/appauth';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private urlsToNotUse: Array<string>;

  private tokenIsRefreshed$ = defer(() =>
    this.authService.forceRefreshToken()
  ).pipe(
    tapLog('Asking for a new token, after 401 error'),
    // We are sharing observable, until there is no 401 request waiting for a new token
    share({
      resetOnRefCountZero: true,
    })
  );

  private sharedToken$: Observable<TokenResponse> =
    this.authService.validToken$;

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
    if (!this.isValidRequestForInterceptor(req.url)) {
      return next.handle(req);
    }
    return this.handle(req, next);
  }

  handle(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.sharedToken$.pipe(
      take(1),
      // timeout({ first: 5000 }),
      tap(() => this.spinnerService.show()),
      concatMap((token) => {
        // TODO: is this always true?
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
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(req, next);
            }
            throwError(() => error);
          })
        );
      }),
      finalize(() => {
        this.spinnerService.hide();
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.tokenIsRefreshed$.pipe(
      concatMap(() => this.sharedToken$.pipe(take(1))),
      concatMap((token) =>
        next.handle(this.changeToken(token.accessToken, request))
      ),
      catchError((err) => {
        this.authService.logout();
        return throwError(() => err);
      })
    );
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

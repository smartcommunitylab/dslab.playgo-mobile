import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { UserService } from '../shared/services/user.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: ReplaySubject<any> = new ReplaySubject<any>(null);
    public refreshToken$: Observable<string> =
        this.refreshTokenSubject.asObservable();
    constructor(private authService: AuthService,
        private userService: UserService) { }
    // eslint-disable-next-line @typescript-eslint/ban-types
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {

        return next.handle(req).pipe(catchError((error: HttpErrorResponse) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(req, next);
            }
            return throwError(error);
        }));
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
                }
                else {
                    this.isRefreshing = false;
                    //logout
                    this.userService.logout();
                    // this.authService.signOut();
                    // this.localStorageService.clearUser();
                    // this.navCtrl.navigateRoot('login');
                }
            } catch (e) {
                this.isRefreshing = false;
                return throwError(e);
            }
        }
    }
    changeToken(accessToken: string, request: HttpRequest<any>) {
        return request.clone({ headers: request.headers.set('Authorization', `Bearer ${accessToken}`) });
    }
    ;
}

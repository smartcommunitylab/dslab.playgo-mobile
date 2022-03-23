import { Injectable } from '@angular/core';
import { Requestor } from '@openid/appauth';
import { AuthService } from 'ionic-appauth';
import { filter, map, shareReplay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  public headers$ = this.auth.token$.pipe(
    filter(Boolean),
    map((token) => this.addHeaders(token)),
    shareReplay(1)
  );

  constructor(private requestor: Requestor, private auth: AuthService) {}

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: any
  ) {
    return this.requestor.xhr<T>({
      url,
      method,
      data: JSON.stringify(body),
      headers: await this.getHeaders(),
    });
  }

  /** Waits for the first token available, but later it will return headers with active token immediately */
  public async getHeaders() {
    const headers = await this.headers$.pipe(take(1)).toPromise();
    console.log('headers:', headers);
    return headers;
  }

  private addHeaders(token: any) {
    return token
      ? {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `${
            token.tokenType === 'bearer' ? 'Bearer' : token.tokenType
          } ${token.accessToken}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        }
      : {};
  }
}

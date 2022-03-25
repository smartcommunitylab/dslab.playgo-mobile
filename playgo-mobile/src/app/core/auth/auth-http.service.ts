import { Injectable } from '@angular/core';
import { Requestor } from '@openid/appauth';
import { AuthService } from 'ionic-appauth';
import { castArray, trim } from 'lodash-es';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  public headers$ = this.auth.token$.pipe(
    filter(Boolean),
    map((token) => this.addHeaders(token)),
    shareReplay(1)
  );

  constructor(private requestor: Requestor, private auth: AuthService) { }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: Endpoint,
    body?: any
  ) {
    return this.requestor.xhr<T>({
      url: this.getApiUrl(endpoint),
      method,
      data: JSON.stringify(body),
      headers: await this.getHeaders(),
    });
  }

  /** Waits for the first token available, but later it will return headers with active token immediately */
  public async getHeaders() {
    const headers = await this.headers$.pipe(take(1)).toPromise();
    return headers;
  }

  public getApiUrl(endpoint: Endpoint): string {
    return joinUriPathNames(environment.serverUrl.apiUrl, ...castArray(endpoint));
  }

  private addHeaders(token: any) {
    return token
      ? {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `${token.tokenType === 'bearer' ? 'Bearer' : token.tokenType
          } ${token.accessToken}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      }
      : {};
  }
}

export type Endpoint = string | string[];

function joinUriPathNames(...pathNames: string[]): string {
  return pathNames
    .map((eachPathNamePart) => trim(eachPathNamePart, '/'))
    .join('/');
}

import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { Observable } from 'rxjs';
import { filter, first, mapTo, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppStatusService {
  public appReady$: Observable<void> = this.auth.token$.pipe(
    filter(Boolean),
    mapTo(undefined as void),
    first(),
    shareReplay(1)
  );
  private appReadyPromise = this.appReady$.toPromise();

  constructor(private auth: AuthService) {}

  public async appReady(): Promise<void> {
    await this.appReadyPromise;
  }
}

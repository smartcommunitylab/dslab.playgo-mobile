import { App as AppPluginInternal, AppInfo } from '@capacitor/app';
import { Device as DevicePluginInternal } from '@capacitor/device';
import { Inject, Injectable, NgZone } from '@angular/core';
import { codePush as CodePushPluginInternal } from 'capacitor-codepush';
import {
  combineLatest,
  of,
  fromEvent,
  from,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
  EMPTY,
  interval,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { DeviceInfo } from '@capacitor/device';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';
import { ILocalPackage } from 'capacitor-codepush/dist/esm/package';
import { runInZone, runOutsideAngular } from '../rxjs.utils';

@Injectable({
  providedIn: 'root',
})
export class AppStatusService {
  public isOnline$: Observable<boolean> = merge(
    of(navigator?.onLine),
    of(null).pipe(
      runOutsideAngular(this.zone),
      switchMap(() => interval(1000)),
      map(() => navigator?.onLine)
    ),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(distinctUntilChanged(), runInZone(this.zone), shareReplay(1));

  public deviceInfo$: Observable<DeviceInfo> = from(
    this.devicePlugin.getInfo()
  ).pipe(shareReplay(1));

  public appInfo$: Observable<AppInfo> = from(this.appPlugin.getInfo()).pipe(
    shareReplay(1)
  );

  public version$: Observable<string> = this.appInfo$.pipe(
    map((info) => info.version)
  );

  private syncFinished$ = new ReplaySubject<boolean>(1);
  public codePushLabel$: Observable<string> = this.syncFinished$.pipe(
    switchMap((success) =>
      combineLatest([
        of(success),
        this.codePushPlugin.getCurrentPackage(),
        this.codePushPlugin.getPendingPackage(),
      ]).pipe(
        map((a) => a),
        catchError((error) => {
          this.errorService.handleError(error, 'silent');
          return of([false, { label: 'unknown' }, null] as [
            boolean,
            ILocalPackage,
            ILocalPackage
          ]);
        })
      )
    ),
    map(([successSync, currentPackage, pendingPackage]) => {
      let hotCodePushLabel = '';

      if (!environment.useCodePush) {
        hotCodePushLabel = '(code push disabled)';
      } else {
        const fallbackLabel = successSync ? '-' : 'unknown';
        hotCodePushLabel = currentPackage?.label || fallbackLabel;
      }

      const pendingPackageLabel = pendingPackage
        ? ` (pending: ${pendingPackage.label})`
        : '';
      return hotCodePushLabel + pendingPackageLabel;
    })
  );

  constructor(
    @Inject('AppPlugin')
    private appPlugin: typeof AppPluginInternal,
    @Inject('DevicePlugin')
    private devicePlugin: typeof DevicePluginInternal,
    @Inject('CodePushPlugin')
    private codePushPlugin: typeof CodePushPluginInternal,
    private errorService: ErrorService,
    private zone: NgZone
  ) {}

  codePushSyncFinished(success: boolean) {
    this.syncFinished$.next(success);
  }
}

import { App as AppPluginInternal, AppInfo } from '@capacitor/app';
import { Device as DevicePluginInternal } from '@capacitor/device';
import { Inject, Injectable } from '@angular/core';
import { codePush } from 'capacitor-codepush';
import {
  combineLatest,
  of,
  fromEvent,
  from,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DeviceInfo } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class AppStatusService {
  public isOnline$: Observable<boolean> = merge(
    of(navigator?.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(shareReplay(1));

  public deviceInfo$: Observable<DeviceInfo> = from(
    this.devicePlugin.getInfo()
  ).pipe(shareReplay(1));

  public appInfo$: Observable<AppInfo> = from(this.appPlugin.getInfo()).pipe(
    shareReplay(1)
  );

  public version$: Observable<string> = this.appInfo$.pipe(
    map((info) => info.version)
  );

  private syncFinished$ = new ReplaySubject<void>(1);
  public codePushLabel$: Observable<string> = this.syncFinished$.pipe(
    switchMap(() =>
      combineLatest([
        codePush.getCurrentPackage(),
        codePush.getPendingPackage(),
      ])
    ),
    map(
      ([currentPackage, pendingPackage]) =>
        `${currentPackage?.label || '-'}${
          pendingPackage ? ` (pending: ${pendingPackage.label})` : ''
        }`
    )
  );

  constructor(
    @Inject('AppPlugin')
    private appPlugin: typeof AppPluginInternal,
    @Inject('DevicePlugin')
    private devicePlugin: typeof DevicePluginInternal
  ) {}

  codePushSyncFinished() {
    this.syncFinished$.next();
  }
}

import { App as AppPluginInternal } from '@capacitor/app';
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
import { tapLog } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class AppStatusService {
  public isOnline$: Observable<boolean> = merge(
    of(navigator?.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(shareReplay(1));

  public version$: Observable<string> = from(this.appPlugin.getInfo()).pipe(
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
    private appPlugin: typeof AppPluginInternal
  ) {}

  codePushSyncFinished() {
    this.syncFinished$.next();
  }
}

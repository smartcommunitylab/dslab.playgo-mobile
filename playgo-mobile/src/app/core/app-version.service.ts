import { App as AppPluginInternal } from '@capacitor/app';
import { Inject, Injectable } from '@angular/core';
import { codePush } from 'capacitor-codepush';
import { combineLatest, from, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { tapLog } from './shared/utils';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
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

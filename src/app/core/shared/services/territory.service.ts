import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import {
  EMPTY,
  from,
  interval,
  Observable,
  of,
  ReplaySubject,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  share,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { TerritoryControllerService } from '../../api/generated/controllers/territoryController.service';
import { Territory } from '../../api/generated/model/territory';
import { tap } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';
import { ifOfflineUseStored } from '../rxjs.utils';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class TerritoryService {
  private territoriesStorage =
    this.localStorageService.getStorageOf<Territory[]>('territories');
  private territoryStorage =
    this.localStorageService.getStorageOf<Territory>('territory');

  private trigger$: Observable<number> = interval(600000);
  public territories$: Observable<Territory[]> = this.trigger$.pipe(
    startWith(0),
    switchMap((triggerId) => {
      const isFirstCall = triggerId === 0;
      return this.territoryControllerService
        .getTerritoriesUsingGET()
        .pipe(
          ifOfflineUseStored(this.territoriesStorage),
          this.errorService.getErrorHandler(isFirstCall ? 'blocking' : 'silent')
        );
    }),
    distinctUntilChanged(isEqual),
    tap((territory) => this.territoriesStorage.set(territory)),
    shareReplay(1)
  );

  constructor(
    private territoryControllerService: TerritoryControllerService,
    private localStorageService: LocalStorageService,
    private errorService: ErrorService
  ) {}

  /**
   * Gets the territory by id. Works also offline.
   *
   * @throws http error
   */
  public getTerritory(territoryId: string): Observable<Territory> {
    return this.territoryControllerService
      .getTerritoryUsingGET(territoryId)
      .pipe(
        ifOfflineUseStored(
          this.territoryStorage,
          (storedTerritory) => storedTerritory.territoryId === territoryId
        ),
        tap((territory) => this.territoryStorage.set(territory))
      );
  }
}

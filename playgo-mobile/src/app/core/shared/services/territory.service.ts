import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import { from, interval, Observable, of, ReplaySubject, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  share,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TerritoryControllerService } from '../../api/generated/controllers/territoryController.service';
import { Territory } from '../../api/generated/model/territory';

@Injectable({ providedIn: 'root' })
export class TerritoryService {
  // private resourceUrl = environment.serverUrl.apiUrl + environment.serverUrl.territory;
  private trigger$: Observable<number> = interval(600000);
  public territories$: Observable<Territory[]> = this.trigger$.pipe(
    startWith(0),
    switchMap((num) => this.getTerritories()),
    distinctUntilChanged(isEqual),
    shareReplay(1)
  );

  constructor(private territoryControllerService: TerritoryControllerService) {}

  getTerritory(territoryId: string): Observable<Territory> {
    return this.territoryControllerService.getTerritoryUsingGET(territoryId);
  }
  private getTerritories(): Observable<Territory[]> {
    return this.territoryControllerService.getTerritoriesUsingGET();
  }
}

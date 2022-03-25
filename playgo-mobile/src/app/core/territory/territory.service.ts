import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, interval, Observable, of, ReplaySubject, timer } from 'rxjs';
import { catchError, share, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../auth/auth-http.service';
import { ITerritory } from './territory.model';

@Injectable({ providedIn: 'root' })
export class TerritoryService {
    // private resourceUrl = environment.serverUrl.apiUrl + environment.serverUrl.territory;
    private trigger$: Observable<number> = interval(600000);
    public territories$: Observable<ITerritory[]> = this.trigger$.pipe(
        startWith(0),
        switchMap(num => this.getTerritories().pipe(
            catchError(err => of([{ territoryId: '1', name: 'Trentino' + num }, { territoryId: '2', name: 'Lecco' }])),
        )),
        shareReplay()
    );

    constructor(private authHttpService: AuthHttpService) {
        this.territories$.subscribe();
    }
    getTerritory(territoryId: string): Observable<ITerritory> {
        return from(this.authHttpService.request<ITerritory>('GET', `${environment.serverUrl.territory}/${territoryId}`));
    }
    getTerritories(): Observable<ITerritory[]> {
        return from(this.authHttpService.request<ITerritory[]>('GET', environment.serverUrl.territory));
    }

}

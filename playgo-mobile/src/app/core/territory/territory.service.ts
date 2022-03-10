import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ITerritory, Territory } from './territory.model';

@Injectable({ providedIn: 'root' })
export class TerritoryService {
    private resourceUrl = environment.serverUrl.server + environment.serverUrl.territory;
    private territoriesSubject = new ReplaySubject<ITerritory[]>();
    private territoryList: ITerritory[];
    public territories$: Observable<ITerritory[]> =
        this.territoriesSubject.asObservable();
    constructor(private http: HttpClient) {
        this.init();
    }
    private async init() {
        try {
            this.updateTerritories();
        }
        catch (e) {
            console.error(e);
        }
    }
    updateTerritories() {
        this.getTerritories().subscribe(territories => {
            this.territoryList = territories;
            this.territoriesSubject.next(this.territoryList);
        });
    }
    getTerritory(territoryId: string): Observable<ITerritory> {
        return this.http.get<ITerritory>(`${this.resourceUrl}/${territoryId}`);
    }
    getTerritories(): Observable<ITerritory[]> {
        return of([{ territoryId: '1', name: 'Trentino' }, { territoryId: '2', name: 'Lecco' }]);
        //return this.http.get<ITerritory[]>(this.resourceUrl);
    }

}

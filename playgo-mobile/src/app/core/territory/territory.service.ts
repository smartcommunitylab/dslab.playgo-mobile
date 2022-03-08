import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ITerritory } from './territory.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    public resourceUrl = environment.serverUrl.server + environment.serverUrl.territory;
    constructor(private http: HttpClient) { }

    getTerritory(territoryId: string): Observable<ITerritory> {
        return this.http.get<ITerritory>(`${this.resourceUrl}/${territoryId}`);
    }
    getTerritories(): Observable<ITerritory[]> {
        return this.http.get<ITerritory[]>(this.resourceUrl);
    }

}

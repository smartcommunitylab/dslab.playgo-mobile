import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    public resourceUrl = environment.serverUrl.server + environment.serverUrl.player;
    constructor(private http: HttpClient) { }

    registerPlayer(user: IUser): Observable<IUser> {
        return this.http.post<IUser>(this.resourceUrl, user);
    }
    getPlayer(): Observable<IUser> {
        return this.http.get<IUser>(this.resourceUrl);
    }
    updatePlayer(user: IUser): Observable<IUser> {
        return this.http.put<IUser>(this.resourceUrl, user);
    }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SchoolApiService {
    constructor(private http: HttpClient) { }
    public canSubscribeUsingGET(initiativeId: string, nickname: string): Observable<boolean> {
        return this.http.request<boolean>(
            'get',
            environment.serverUrl.hscApi +
            `/api/initiatives/${encodeURIComponent(String(initiativeId))}/player/subscribe/check`,
            {
                params: removeNullOrUndefined({
                    nickname
                }),
            }
        );
    }
}
function removeNullOrUndefined(obj: any) {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] != null) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

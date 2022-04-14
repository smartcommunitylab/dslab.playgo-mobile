import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../../auth/auth-http.service';
import { IStatus } from '../model/status.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private statusSubject = new ReplaySubject<IStatus>();
    public userStatus$: Observable<IStatus> =
        this.statusSubject.asObservable();
    constructor(private authHttpService: AuthHttpService) {
    }
    getStatus(): Promise<IStatus> {
        return this.authHttpService
            .request<IStatus>(
                'GET',
                environment.serverUrl.status);
    }
}

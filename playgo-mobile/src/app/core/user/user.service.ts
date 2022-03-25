import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../auth/auth-http.service';
import { IUser } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    public resourceUrl = environment.serverUrl.server + environment.serverUrl.player;
    constructor(private authHttpService: AuthHttpService) { }

    registerPlayer(user: IUser): Promise<IUser> {
        return this.authHttpService.request<IUser>('POST', this.resourceUrl, user);
    }
    getPlayer(): Promise<IUser> {
        return this.authHttpService.request<IUser>('GET', this.resourceUrl);
    }
    updatePlayer(user: IUser): Promise<IUser> {
        return this.authHttpService.request<IUser>('PUT', this.resourceUrl, user);
    }

}

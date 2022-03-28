import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../auth/auth-http.service';
import { IUser } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private authHttpService: AuthHttpService) { }

    registerPlayer(user: IUser): Promise<IUser> {
        return this.authHttpService.request<IUser>('POST', environment.serverUrl.register, user);
    }
    async isUserRegistered(): Promise<boolean> {
        try {
            const user = await this.authHttpService.request<IUser>('GET', environment.serverUrl.profile);
            if (user) {
                //user registered
                return true;
            }
            else {
                //user not registered
                return false;
            }
        } catch (e) {
            {
                return false;
            }
        }
    }
    getProfile(): Promise<IUser> {
        return this.authHttpService.request<IUser>('GET', environment.serverUrl.profile);
    }
    getPlayer(): Promise<IUser> {
        return this.authHttpService.request<IUser>('GET', environment.serverUrl.player);
    }
    updatePlayer(user: IUser): Promise<IUser> {
        return this.authHttpService.request<IUser>('PUT', environment.serverUrl.player, user);
    }

}

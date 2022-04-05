import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../auth/auth-http.service';
import { IUser } from './user.model';
import localeItalian from '@angular/common/locales/it';
import localeEnglish from '@angular/common/locales/en';
@Injectable({ providedIn: 'root' })
export class UserService {
    private userProfileSubject = new ReplaySubject<IUser>();
    private userLocale: string;
    private userProfile: IUser = null;
    public userProfile$: Observable<IUser> =
        this.userProfileSubject.asObservable();

    constructor(
        private authHttpService: AuthHttpService,
        public translateService: TranslateService
    ) {
        this.startService();
    }
    set locale(value: string) {
        this.userLocale = value;
    }
    get locale(): string {
        return this.userLocale || 'en-US';
    }

    registerLocale(locale: string) {
        if (!locale) {
            return;
        }
        // Register locale data since only the en-US locale data comes with Angular
        switch (locale) {
            case 'it': {
                this.userLocale = 'it-IT';
                registerLocaleData(localeItalian);
                break;
            }
            case 'en': {
                this.userLocale = 'en-US';
                registerLocaleData(localeItalian);
                break;
            }

        }
    }
    async startService() {
        //check if locally present and I'm logged (store in the memory)
        if (!this.userProfile) {
            try {
                const user = await this.getProfile();
                if (user) {
                    this.userProfile = user;
                    this.processUser(user);
                    this.userProfileSubject.next(this.userProfile);

                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    processUser(user: IUser) {
        this.translateService.use(user.language);
        this.registerLocale(user.language);
    }

    registerPlayer(user: IUser): Promise<IUser> {
        //TODO update local profile
        return this.authHttpService.request<IUser>(
            'POST',
            environment.serverUrl.register,
            user
        );
    }
    async isUserRegistered(): Promise<boolean> {
        try {
            const user = await this.authHttpService.request<IUser>(
                'GET',
                environment.serverUrl.profile
            );
            if (user) {
                //user registered
                return true;
            } else {
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
        return this.authHttpService.request<IUser>(
            'GET',
            environment.serverUrl.profile
        );
    }
    // getPlayer(): Promise<IUser> {
    //     return this.authHttpService.request<IUser>('GET', environment.serverUrl.player);
    // }
    async updatePlayer(user: IUser): Promise<IUser> {
        //TODO update local profile
        const player = await this.authHttpService.request<IUser>(
            'PUT',
            environment.serverUrl.profile,
            user
        );
        this.processUser(user);
        return player;
    }
}

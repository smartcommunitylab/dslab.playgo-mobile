import { Injectable } from '@angular/core';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { BadgeConcept } from '../../api/generated/model/badgeConcept';
import { BadgesData } from '../../api/generated/model/badgesData';
import { AuthService } from '../../auth/auth.service';
import { ErrorService } from './error.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private allBadgesStorage = this.localStorageService.getStorageOf<{
    [key: string]: BadgesData;
  }>('allBadges');

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private gameControllerService: GameControllerService,
    private errorService: ErrorService
  ) {}

  init() {
    this.authService.isReadyForApi$.subscribe(() => {
      //update all badges and store in local storage
      //update all badges since the last time (one week)
      this.gameControllerService
        .getAllBadgesUsingGET()
        .pipe(this.errorService.getErrorHandler('silent'))
        .subscribe((badges) => {
          console.log(badges);
          this.allBadgesStorage.set(badges);
        });
    });
  }
  // FIXME: this is not efficient!
  public async getBadgeByKey(key: string): Promise<BadgesData> {
    return (await this.allBadgesStorage?.get())[key];
  }
}

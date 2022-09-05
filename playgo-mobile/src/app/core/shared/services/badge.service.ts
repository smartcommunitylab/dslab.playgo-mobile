import { Injectable } from '@angular/core';
import { Observable, tap, switchMap, shareReplay, firstValueFrom } from 'rxjs';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { BadgesData } from '../../api/generated/model/badgesData';
import { AuthService } from '../../auth/auth.service';
import { ErrorService } from './error.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private allBadgesStorage =
    this.localStorageService.getStorageOf<AllBadgesData>('allBadges');

  private allBadges$: Observable<AllBadgesData> =
    this.authService.isReadyForApi$.pipe(
      switchMap(() => this.allBadgesStorage.getMeta()),
      switchMap(({ lastUpdated }) =>
        this.checkIfStoredBadgesAreUpToDate(lastUpdated)
          ? this.allBadgesStorage.get()
          : this.gameControllerService.getAllBadgesUsingGET().pipe(
              tap((badges) => this.allBadgesStorage.set(badges)),
              this.errorService.getErrorHandler('silent')
            )
      ),
      shareReplay(1)
    );

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private gameControllerService: GameControllerService,
    private errorService: ErrorService
  ) {}

  init() {
    // run api call as soon as possible
    this.allBadges$.subscribe();
  }

  // call api only once per week
  checkIfStoredBadgesAreUpToDate(lastUpdated: number): boolean {
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return lastUpdated + oneWeek > new Date().getTime();
  }

  public async getBadgeByKey(key: string): Promise<BadgesData> {
    const allBadges = await firstValueFrom(this.allBadges$);
    return allBadges[key];
  }
}

type AllBadgesData = {
  [key: string]: BadgesData;
};

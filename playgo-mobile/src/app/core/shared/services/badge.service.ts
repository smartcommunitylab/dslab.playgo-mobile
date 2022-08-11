import { Injectable } from '@angular/core';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { BadgeConcept } from '../../api/generated/model/badgeConcept';
import { BadgesData } from '../../api/generated/model/badgesData';
import { AuthService } from '../../auth/auth.service';
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
    private gameControllerService: GameControllerService
  ) {}

  init() {
    this.authService.isReadyForApi$.subscribe(() => {
      //update all badges and store in local storage
      this.gameControllerService.getAllBadgesUsingGET().subscribe((badges) => {
        console.log(badges);
        this.allBadgesStorage.set(badges);
      });
    });
  }
  public getBadgeByKey(key: string): BadgesData {
    return this.allBadgesStorage?.get()[key];
  }
}

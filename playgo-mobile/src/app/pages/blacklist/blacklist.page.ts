import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  map,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';

@Component({
  selector: 'app-blacklist-page',
  templateUrl: './blacklist.page.html',
  styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit {
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  private campaignId: string;
  public blacklistRefresher$: Subject<void> = new ReplaySubject<void>(1);
  private blacklistCouldBeChanged$ = merge(
    this.authService.isReadyForApi$.pipe(map(() => ({ isFirst: true }))),
    this.blacklistRefresher$.pipe(map(() => ({ isFirst: false })))
  );
  public blacklist$: Observable<Array<{ [key: string]: any }>>;
  constructor(
    private challengeService: ChallengeService,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.campaignId$.subscribe((campaignId) => {
      this.campaignId = campaignId;
      this.blacklist$ = this.blacklistCouldBeChanged$.pipe(
        switchMap(() =>
          this.challengeService.getBlacklistByCampaign(campaignId)
        )
      );
    });
  }

  async removeBlacklist(playerId: string) {
    try {
      const removed = await this.challengeService.removeBlacklist(
        this.campaignId,
        playerId
      );
      this.blacklistRefresher$.next();
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    }
  }
}

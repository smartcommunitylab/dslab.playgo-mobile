import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import {
  map,
  merge,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
} from 'rxjs';
import { CampaignInfo } from 'src/app/core/api/generated/model/campaignInfo';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { AuthService } from 'src/app/core/auth/auth.service';
import {
  getImgChallenge,
  getTypeStringChallenge,
} from 'src/app/core/shared/campaigns/campaign.utils';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';

@Component({
  selector: 'app-campaign-stat',
  templateUrl: './campaign-stat.component.html',
  styleUrls: ['./campaign-stat.component.scss'],
})
export class CampaignStatComponent implements OnInit {
  @Input() playerId: string;
  @Input() campaign: CampaignInfo;
  imgChallenge = getImgChallenge;

  public challengeStat$: Observable<any>;
  public reportWeek$: Observable<CampaignPlacing>;
  public reportTotal$: Observable<CampaignPlacing>;
  public blacklisted$: Observable<boolean>;
  public blacklistRefresher$: Subject<void> = new ReplaySubject<void>(1);
  private blacklistCouldBeChanged$ = merge(
    this.authService.isReadyForApi$.pipe(map(() => ({ isFirst: true }))),
    this.blacklistRefresher$.pipe(map(() => ({ isFirst: false })))
  );

  // public points$
  constructor(
    private challengeService: ChallengeService,
    private reportService: ReportService,
    private translateService: TranslateService,
    public campaignService: CampaignService,
    private authService: AuthService,
    private errorService: ErrorService
  ) { }
  getChallengeFrom() {
    return toServerDateOnly(DateTime.utc().minus({ month: 1 }));
  }
  getChallengeTo() {
    return toServerDateOnly(DateTime.utc());
  }
  ngOnInit() {
    this.challengeStat$ = this.challengeService.getChallengeStats({
      campaignId: this.campaign?.campaignId,
      playerId: this.playerId,
      groupMode: 'month',
      dateFrom: toServerDateOnly(DateTime.utc().minus({ month: 1 })),
      dateTo: toServerDateOnly(DateTime.utc()),
    });
    this.reportWeek$ = this.reportService.getGameStats(
      this.campaign?.campaignId,
      this.playerId,
      toServerDateOnly(DateTime.utc().minus({ week: 1 })),
      toServerDateOnly(DateTime.utc())
    );
    this.reportTotal$ = this.reportService.getGameStats(
      this.campaign?.campaignId,
      this.playerId
    );
    this.blacklisted$ = this.blacklistCouldBeChanged$.pipe(
      switchMap(() =>
        this.challengeService
          .getBlacklistByCampaign(this.campaign?.campaignId)
          .pipe(
            map((blacklist) =>
              blacklist.map((user) => user.id).includes(this.playerId)
            )
          )
      )
    );
  }
  typeChallenge(type: string) {
    return this.translateService.instant(getTypeStringChallenge(type));
  }
  async removeBlacklist() {
    try {
      const removed = await this.challengeService.removeBlacklist(
        this.campaign.campaignId,
        this.playerId
      );
      this.blacklistRefresher$.next();
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    }
  }
  async addBlacklist() {
    try {
      const removed = await this.challengeService.addBlacklist(
        this.campaign.campaignId,
        this.playerId
      );
      this.blacklistRefresher$.next();
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    }
  }
}

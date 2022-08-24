import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { map, Observable } from 'rxjs';
import { CampaignInfo } from 'src/app/core/api/generated/model/campaignInfo';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import {
  getImgChallenge,
  getTypeStringChallenge,
} from 'src/app/core/shared/utils';

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
  // public points$
  constructor(
    private challengeService: ChallengeService,
    private reportService: ReportService,
    private translateService: TranslateService,
    public campaignService: CampaignService
  ) {}

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
    this.blacklisted$ = this.challengeService
      .getBlacklistByCampaign(this.campaign?.campaignId)
      .pipe(
        map((blacklist) =>
          blacklist.map((user) => user.id).includes(this.playerId)
        )
      );
  }
  typeChallenge(type: string) {
    return this.translateService.instant(getTypeStringChallenge(type));
  }
}

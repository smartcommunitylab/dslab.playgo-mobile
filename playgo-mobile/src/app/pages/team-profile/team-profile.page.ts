import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  map,
  distinctUntilChanged,
  shareReplay,
  switchMap,
  combineLatest,
  tap,
} from 'rxjs';
import { CampaignInfo } from 'src/app/core/api/generated/model/campaignInfo';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { intersectionWith, isEqual } from 'lodash-es';
import { tapLog } from 'src/app/core/shared/rxjs.utils';
import { Avatar } from 'src/app/core/api/generated/model/avatar';
import { TeamService } from 'src/app/core/shared/services/team.service';

@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.page.html',
  styleUrls: ['./team-profile.page.scss'],
})
export class TeamProfilePage implements OnInit {
  public teamId$: Observable<string> = this.route.params.pipe(
    map((params) => params.teamId),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public initiativeId$: Observable<string> = this.route.params.pipe(
    map((params) => params.initiativeId),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public userAvatar$: Observable<Avatar> = this.teamId$.pipe(
    switchMap((teamId) =>
      this.teamService
        .getTeamAvatar(teamId)
        .pipe(this.errorService.getErrorHandler())
    ),
    shareReplay(1)
  );
  // public campaigns$: Observable<CampaignInfo[]> = combineLatest([
  //   this.teamId$,
  //   this.initiativeId$,
  // ]).pipe(
  //   switchMap(([userId, myCampaigns]) =>
  //     this.campaignService.getCampaignByPlayerId(userId).pipe(
  //       tapLog('Initial Campaign'),
  //       map(
  //         //filter my campaigns in order to have only common campaigns
  //         (otherUserCampaigns) =>
  //         // eslint-disable-next-line max-len
  //         {
  //           const intersection = intersectionWith(
  //             otherUserCampaigns.map((campaign) => campaign.campaignId),
  //             myCampaigns.map((campaign) => campaign.campaign.campaignId),
  //             isEqual
  //           );
  //           return otherUserCampaigns.filter(
  //             (campaign) =>
  //               intersection.includes(campaign.campaignId) &&
  //               campaign.type !== 'personal' &&
  //               campaign.type !== 'company'
  //           );
  //         }
  //       ),
  //       tapLog('filteredcampaign'),
  //       ////filter personal campaign and campaigns without challenge 'personal' && 'company'
  //       this.errorService.getErrorHandler()
  //     )
  //   ),
  //   tap((campaigns) => console.log(campaigns)),
  //   shareReplay(1)
  // );
  // public campaigns: PlayerCampaign[] = [];
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private teamService: TeamService,
    private campaignService: CampaignService
  ) { }

  ngOnInit() { }
}

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
  filter,
  of,
  from,
} from 'rxjs';
import { CampaignInfo } from 'src/app/core/api/generated/model/campaignInfo';
import { Player } from 'src/app/core/api/generated/model/player';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Avatar } from 'src/app/core/shared/model/avatar.model';
import { IUser } from 'src/app/core/shared/model/user.model';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { intersectionWith, isEqual } from 'lodash-es';
import { tapLog } from 'src/app/core/shared/rxjs.utils';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  public userId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public userNickname$: Observable<string> = this.route.params.pipe(
    map((params) => params.nickname),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public userAvatar$: Observable<IUser['avatar']> = this.userId$.pipe(
    switchMap((userId) =>
      this.userService
        .getOtherPlayerAvatar(userId)
        .pipe(this.errorService.getErrorHandler())
    ),
    shareReplay(1)
  );
  public campaigns$: Observable<CampaignInfo[]> = combineLatest([
    this.userId$,
    this.campaignService.myCampaigns$,
  ]).pipe(
    switchMap(([userId, myCampaigns]) =>
      this.campaignService.getCampaignByPlayerId(userId).pipe(
        tapLog('Initial Campaign'),
        map(
          //filter my campaigns in order to have only common campaigns
          (otherUserCampaigns) =>
            // eslint-disable-next-line max-len
            {
              const intersection = intersectionWith(
                otherUserCampaigns.map((campaign) => campaign.campaignId),
                myCampaigns.map((campaign) => campaign.campaign.campaignId),
                isEqual
              );
              return otherUserCampaigns.filter(
                (campaign) =>
                  intersection.includes(campaign.campaignId) &&
                  campaign.type !== 'personal' &&
                  campaign.type !== 'company'
              );
            }
        ),
        tapLog('filteredcampaign'),
        ////filter personal campaign and campaigns without challenge 'personal' && 'company'
        this.errorService.getErrorHandler()
      )
    ),
    tap((campaings) => console.log(campaings)),
    shareReplay(1)
  );
  // public campaigns: PlayerCampaign[] = [];
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private userService: UserService,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {}
}

import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CampaignPlacing } from 'src/app/core/api/generated-hsc/model/campaignPlacing';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-school-placing-detail',
  templateUrl: './school-placing-detail.component.html',
  styleUrls: ['./school-placing-detail.component.scss'],
})
export class SchoolPlacingDetailComponent implements OnInit {
  @Input()
  placing: CampaignPlacing;
  @Input()
  unitLabelKey: TranslateKey;
  @Input() mine: boolean;
  @Input() campaign: PlayerCampaign;
  @Input() myTeam: PlayerTeam;
  @Input() teamId: string;

  // playerId$ = this.userService.userProfile$.pipe(
  //   map((userProfile) => userProfile.playerId)
  // );

  // playerAvatarUrl$ = this.userService.userProfile$.pipe(
  //   map((userProfile) => userProfile.avatar.avatarSmallUrl)
  // );

  constructor(private userService: UserService, private teamService: TeamService) { }
  getValue(value: number) {
    if (
      this.unitLabelKey === 'campaigns.leaderboard.leaderboard_type_unit.km'
    ) {
      return value / 1000;
    }
    return value;
  }
  ngOnInit() {
    console.log(this.placing);
    // this.myTeam$ = this.teamService.getMyTeam(
    //   this.campaign?.campaign?.campaignId,
    //   this.campaign?.subscription?.campaignData?.teamId
    // ).pipe(shareReplay(1));
  }
}


import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-placing-detail',
  templateUrl: './placing-detail.component.html',
  styleUrls: ['./placing-detail.component.scss'],
})
export class PlacingDetailComponent implements OnInit {
  @Input()
  placing: CampaignPlacing;
  @Input()
  unitLabelKey: TranslateKey;
  @Input() first: boolean;
  @Input() campaign: PlayerCampaign;

  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );

  playerAvatarUrl$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.avatar.avatarSmallUrl)
  );

  constructor(private userService: UserService) { }
  getValue(value: number) {
    if (
      this.unitLabelKey === 'campaigns.leaderboard.leaderboard_type_unit.km'
    ) {
      return value / 1000;
    }
    return value;
  }
  ngOnInit() { }
  getIcon() {
    //get icon based on unitLabelKey
    switch (this.unitLabelKey) {
      case 'campaigns.leaderboard.leaderboard_type_unit.km':
        return '';
      case 'campaigns.leaderboard.leaderboard_type_unit.co2':
        return 'co2';
      case 'campaigns.leaderboard.leaderboard_type_unit.GL':
        return 'ecoLeavesCity';
      default:
        return '';
    }
  }

}

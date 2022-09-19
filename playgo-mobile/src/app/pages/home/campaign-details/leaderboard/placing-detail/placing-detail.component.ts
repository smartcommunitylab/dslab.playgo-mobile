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

  constructor(private userService: UserService) {}

  ngOnInit() {}
}

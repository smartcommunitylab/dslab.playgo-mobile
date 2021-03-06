import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';
import { TranslateKey } from 'src/app/core/shared/type.utils';

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

  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );

  playerAvatarUrl$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.avatar.avatarSmallUrl)
  );

  constructor(private userService: UserService) {}

  ngOnInit() {}
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { PlayerTeamControllerService } from 'src/app/core/api/generated-hsc/controllers/playerTeamController.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { User } from 'src/app/core/shared/services/user.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';


@Component({
  selector: 'app-home-school-profile',
  templateUrl: './home-school-profile.component.html',
  styleUrls: ['./home-school-profile.component.scss'],
})
export class HomeSchoolProfiloComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() player: User;
  myTeam$: Observable<PlayerTeam>;

  constructor(
    private playerTeamController: PlayerTeamControllerService

  ) { }

  ngOnInit() {
    this.myTeam$ = this.playerTeamController.getMyTeamInfoUsingGET(
      {
        initiativeId: this.campaignContainer?.campaign?.campaignId,
        teamId: this.campaignContainer?.subscription?.campaignData?.teamId
      });
  }
  goToChallenge(event: Event) {

  }

  ngOnDestroy() {
  }
}

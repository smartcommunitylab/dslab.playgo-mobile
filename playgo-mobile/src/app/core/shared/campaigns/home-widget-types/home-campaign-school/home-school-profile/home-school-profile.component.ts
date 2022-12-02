import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { PlayerTeamControllerService } from 'src/app/core/api/generated-hsc/controllers/playerTeamController.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TeamService } from 'src/app/core/shared/services/team.service';
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
    private teamService: TeamService

  ) { }

  ngOnInit() {
    this.myTeam$ = this.teamService.getMyTeam(
      this.campaignContainer?.campaign?.campaignId,
      this.campaignContainer?.subscription?.campaignData?.teamId
    );
  }
  goToChallenge(event: Event) {

  }

  ngOnDestroy() {
  }
}

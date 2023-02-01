import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { PlayerTeamControllerService } from 'src/app/core/api/generated-hsc/controllers/playerTeamController.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { Avatar } from 'src/app/core/api/generated/model/avatar';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ErrorService } from 'src/app/core/shared/services/error.service';
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
  teamAvatar$: Observable<Avatar>;
  constructor(
    private teamService: TeamService,
    private errorService: ErrorService,
    private navController: NavController

  ) { }

  ngOnInit() {
    this.myTeam$ = this.teamService.getMyTeam(
      this.campaignContainer?.campaign?.campaignId,
      this.campaignContainer?.subscription?.campaignData?.teamId
    );
    this.teamAvatar$ = this.myTeam$.pipe(
      switchMap((myTeam) =>
        this.teamService
          .getTeamAvatar(myTeam.id)
          .pipe(this.errorService.getErrorHandler())
      ),
      shareReplay(1)
    );
  }
  goToChallenge(event: Event) {

  }
  gotToProfile(event: Event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateForward('/pages/team-profile/' +
      this.campaignContainer?.campaign?.campaignId +
      '/' +
      this.campaignContainer?.subscription?.campaignData?.teamId +
      '/my');
  }
  ngOnDestroy() {
  }
}

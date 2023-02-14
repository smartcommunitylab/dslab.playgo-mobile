import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  map,
  distinctUntilChanged,
  shareReplay,
  switchMap,
  combineLatest,
} from 'rxjs';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Avatar } from 'src/app/core/api/generated/model/avatar';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { TransportStat } from 'src/app/core/api/generated-hsc/model/transportStat';
import { getTransportTypeIcon, getTransportTypeLabel } from 'src/app/core/shared/tracking/trip.model';
import { TeamMember } from 'src/app/core/api/generated-hsc/model/teamMember';

@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.page.html',
  styleUrls: ['./team-profile.page.scss'],
})
export class TeamProfilePage implements OnInit {
  getTransportTypeIcon = getTransportTypeIcon;
  getTransportTypeLabel = getTransportTypeLabel;

  public userProfile$ = this.userService.userProfile$.pipe(
    shareReplay(1)
  );
  public playerId$ = this.userProfile$.pipe(
    map((userProfile) => userProfile.playerId),
    shareReplay(1)
  );
  public teamId$: Observable<string> = this.route.params.pipe(
    map((params) => params.teamId),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public type$: Observable<string> = this.route.params.pipe(
    map((params) => params.type),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public initiativeId$: Observable<string> = this.route.params.pipe(
    map((params) => params.initiativeId),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public teamAvatar$: Observable<Avatar> = this.teamId$.pipe(
    switchMap((teamId) =>
      this.teamService
        .getTeamAvatar(teamId)
        .pipe(this.errorService.getErrorHandler())
    ),
    shareReplay(1)
  );
  public team$: Observable<PlayerTeam> = combineLatest([
    this.teamId$, this.initiativeId$, this.type$
  ]).pipe(
    switchMap(([teamId, initiativeId, type]) => {
      if (type === 'public') {
        return this.teamService.getPublicTeam(
          initiativeId,
          teamId);
      } else {
        return this.teamService.getMyTeam(
          initiativeId,
          teamId);
      }
    }),
    shareReplay(1));
  public status$: Observable<CampaignPlacing> = combineLatest([
    this.teamId$, this.initiativeId$
  ]).pipe(
    switchMap(([teamId, initiativeId]) =>
      this.teamService.getTeamPlacing(initiativeId, teamId)));

  public myStatus$: Observable<PlayerGameStatus> =
    this.initiativeId$.pipe(
      switchMap(initiativeID => this.reportService.getGameStatus(initiativeID)));

  public stat$: Observable<TransportStat[]> = combineLatest([
    this.teamId$, this.initiativeId$
  ]).pipe(
    switchMap(([teamId, initiativeId]) =>
      this.teamService.getTeamAvg(initiativeId, teamId, 'km')));
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private teamService: TeamService,
    private userService: UserService,
    private reportService: ReportService
  ) { }

  ngOnInit() {
  }
  getMembers(members: TeamMember[]): number {
    return members?.filter(x => x.subscribed === true).length;
  }

}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { Avatar } from 'src/app/core/api/generated/model/avatar';
import { OtherAttendeeData } from 'src/app/core/api/generated/model/otherAttendeeData';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-challenge-users-status',
  templateUrl: './challenge-users-status.component.html',
  styleUrls: ['./challenge-users-status.component.scss'],
})
export class ChallengeUsersStatusComponent implements OnInit, OnDestroy {
  @Input() status: number;
  @Input() rowStatus: number;
  @Input() type: string;
  @Input() otherUser?: OtherAttendeeData;
  @Input() position?: string;
  @Input() challengeType: string;
  @Input() unitHasKm: boolean;
  @Input() kind?: string;
  @Input() campaignContainer: PlayerCampaign;

  playerAvatarUrl$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.avatar.avatarSmallUrl)
  );

  profile$ = this.userService.userProfile$;
  myTeam$: Observable<PlayerTeam>;
  teamAvatar$: Observable<Avatar>;
  // opponentAvatarUrl$: Observable<IUser['avatar']>;
  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private teamService: TeamService
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
  ngOnDestroy() { }
  isWinning(me: number, other: number) {
    if (me > other) {
      return true;
    }
    return false;
  }
  isFuture() {
    return this.type === 'future';
  }
  isCompetitive() {
    if (
      this.challengeType === 'groupCompetitiveTime' ||
      this.challengeType === 'groupCompetitivePerformance'
    ) {
      return true;
    }
    return false;
  }
  isHome() {
    return this.position === 'home';
  }
  isGroupCompetitivePerformance() {
    return this.challengeType === 'groupCompetitivePerformance';
  }
}

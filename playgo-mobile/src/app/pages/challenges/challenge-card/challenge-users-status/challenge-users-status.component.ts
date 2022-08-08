import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { OtherAttendeeData } from 'src/app/core/api/generated/model/otherAttendeeData';
import { IUser } from 'src/app/core/shared/model/user.model';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';

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
  profile: IUser;
  playerAvatarUrl$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.avatar.avatarSmallUrl)
  );
  profile$ = this.userService.userProfile$;
  constructor(
    private userService: UserService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}
  isWinning() {
    if (this.rowStatus > this.otherUser?.row_status) {
      return true;
    }
    return false;
  }
}

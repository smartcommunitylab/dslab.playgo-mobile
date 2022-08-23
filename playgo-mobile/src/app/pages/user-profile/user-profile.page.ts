import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  map,
  distinctUntilChanged,
  shareReplay,
  switchMap,
} from 'rxjs';
import { Avatar } from 'src/app/core/shared/model/avatar.model';
import { IUser } from 'src/app/core/shared/model/user.model';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  public userId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public userNickname$: Observable<string> = this.route.params.pipe(
    map((params) => params.nickname),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public userAvatar$: Observable<IUser['avatar']> = this.userId$.pipe(
    switchMap((userId) =>
      this.userService
        .getOtherPlayerAvatar(userId)
        .pipe(this.errorService.getErrorHandler())
    ),
    shareReplay(1)
  );
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private userService: UserService
  ) {}

  ngOnInit() {}
}

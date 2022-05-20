import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/core/shared/model/user.model';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  subProf: Subscription;
  profile: IUser;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  navigateTo(relativePage: string) {
    this.router.navigate([relativePage], { relativeTo: this.route });
  }
  ngOnInit() {
    this.subProf = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
    });
  }
  ngOnDestroy() {
    this.subProf.unsubscribe();
  }
  updateLanguage() {
    this.userService.updatePlayer(this.profile);
  }
}

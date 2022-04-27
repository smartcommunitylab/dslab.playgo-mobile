import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/core/shared/model/user.model';
import { UserService } from 'src/app/core/shared/services/user.service';
import { IStatus } from '../../model/status.model';
import { ChangeProfileModalPage } from '../change-profile-component/changeProfile.component';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() editable = false;
  @Input() showStatus = true;
  profile: IUser;
  status: IStatus;
  subStat: Subscription;
  subProf: Subscription;
  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.subProf = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
    });
    this.subStat = this.userService.userStatus$.subscribe((status) => {
      this.status = status;
    });
  }
  ngOnDestroy() {
    this.subProf.unsubscribe();
    this.subStat.unsubscribe();
  }
  async openModal() {
    const modal = await this.modalController.create({
      component: ChangeProfileModalPage,
      componentProps: {
        profile: this.profile,
      },
    });

    modal.onDidDismiss().then((profileResponse) => {
      if (profileResponse !== null) {
        //save new profile
        try {
          this.userService.updatePlayer(this.profile);
        } catch (e) { }
      } else {
        //not save and show hi
      }
    });
    return await modal.present();
  }
}

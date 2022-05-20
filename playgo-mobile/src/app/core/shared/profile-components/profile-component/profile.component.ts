import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';
import { IUser } from 'src/app/core/shared/model/user.model';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Territory, TerritoryData } from '../../model/territory.model';
import { CampaignService } from '../../services/campaign.service';
import { readAsBase64 } from '../../utils';

import { ChangeProfileModalPage } from '../change-profile-component/changeProfile.component';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() editable = false;
  image: Photo;
  profile: IUser;
  subProf: Subscription;
  subTerritory: Subscription;
  subCamp: Subscription;
  numMyCampaigns: number;
  territory: Territory;
  activeFrom: string;
  constructor(
    private userService: UserService,
    private campaignService: CampaignService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.subProf = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
    });
    this.subTerritory = this.userService.userProfileTerritory$.subscribe(
      (territory) => {
        this.territory = territory;
      }
    );
    this.subCamp = this.campaignService.myCampaigns$.subscribe(
      (myCampaigns) => {
        this.numMyCampaigns = myCampaigns?.length;
        this.activeFrom = myCampaigns.find(
          (camp) => camp.campaign?.type === 'personal'
        ).subscription?.registrationDate;
      }
    );
  }
  ngOnDestroy() {
    this.subProf.unsubscribe();
    this.subCamp.unsubscribe();
  }
  async changeAvatar() {
    this.image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    const avatarData = await this.userService.uploadAvatar(
      await readAsBase64(this.image)
    );
    if (avatarData) {
      this.userService.updateImages();
    }
  }

  goToProfile() {
    this.navCtrl.navigateRoot('/pages/tabs/home/profile');
  }
}

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Territory } from 'src/app/core/api/generated/model/territory';
import { User, UserService } from 'src/app/core/shared/services/user.service';
import { CampaignService } from '../../services/campaign.service';
import { ErrorService } from '../../services/error.service';
import { readAsBase64 } from '../../utils';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() editable = false;
  image: Photo;
  profile: User;
  subProf: Subscription;
  subTerritory: Subscription;
  subCamp: Subscription;
  numMyCampaigns: number;
  territory: Territory;
  activeFrom: number;
  timeStamp: any;
  linkPicture: string;
  constructor(
    private userService: UserService,
    private campaignService: CampaignService,
    private navCtrl: NavController,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subProf = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
      if (profile) {
        this.setLinkPicture(this.profile?.avatar?.avatarUrl);
      }
    });
    this.subTerritory = this.userService.userProfileTerritory$.subscribe(
      (territory) => {
        this.territory = territory;
      }
    );
    this.subCamp = this.campaignService.myCampaigns$.subscribe(
      (myCampaigns) => {
        this.numMyCampaigns = myCampaigns?.length;
        this.activeFrom = myCampaigns?.find(
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
    await this.userService.uploadAvatar(
      this.profile,
      await readAsBase64(this.image)
    );
  }
  public getLinkPicture() {
    if (this.timeStamp) {
      return this.linkPicture + '?' + this.timeStamp;
    }
    return this.linkPicture;
  }
  public setLinkPicture(url: string) {
    this.linkPicture = url;
    this.timeStamp = new Date().getTime();
  }
  goToProfile() {
    this.navCtrl.navigateForward('/pages/tabs/home/profile');
  }
}

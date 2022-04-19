import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { profile } from 'console';
import { IUser } from 'src/app/core/shared/model/user.model';
import { UserService } from '../../services/user.service';
import { readAsBase64 } from '../../utils';

@Component({
  selector: 'app-change-profile-modal',
  templateUrl: './change-profile-modal.page.html',
  styleUrls: ['./change-profile-modal.page.css'],
})
export class ChangeProfileModalPage implements OnInit, OnChanges {
  @Input() profile: IUser;
  blob: any;
  urlAvatar: any;
  image: Photo;
  avatarData: any;
  constructor(private modalCtr: ModalController,
    private userService: UserService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const safeImg = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + this.profile.avatar.avatarData.data);
    this.urlAvatar = safeImg;
  }
  ngOnChanges() {
    // this.urlAvatar = this.profile.avatar;
    const safeImg = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + this.profile.avatar.avatarData.data);
    this.urlAvatar = safeImg;
  }
  async close() {
    await this.modalCtr.dismiss();
  }
  async closeAndSave() {
    await this.modalCtr.dismiss(this.profile);
  }
  async changeAvatar() {
    console.log('changing avatar');
    this.image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
    });
    // let safeImg = this.sanitizer.bypassSecurityTrustUrl(this.image.webPath);
    const avatarData = await this.userService.uploadAvatar(await readAsBase64(this.image));
    this.userService.updateImage(avatarData);
    // this.urlAvatar = safeImg;
  }
}

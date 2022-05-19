import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertController, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TerritoryService } from 'src/app/core/shared/services/territory.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { readAsBase64 } from 'src/app/core/shared/utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  territoryList = [];
  registrationForm: FormGroup;
  isSubmitted = false;
  blob: any;
  urlAvatar: string | SafeUrl = 'assets/images/registration/generic_user.png';
  image: Photo;
  constructor(
    private userService: UserService,
    private territoryService: TerritoryService,
    public formBuilder: FormBuilder,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer,
    private alertService: AlertService,
    private alertController: AlertController,
    private translate: TranslateService
  ) {
    this.territoryService.territories$.subscribe((territories) => {
      this.territoryList = territories;
    });
  }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      mail: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      nickname: ['', [Validators.required, Validators.minLength(2)]],
      language: ['', [Validators.required]],
      territoryId: ['', [Validators.required]],
      privacy: [false, Validators.requiredTrue]

    });
    this.userService.getAACUserInfo().then((user) => {
      if (user) {
        if (user.email) {
          this.registrationForm.patchValue({ mail: user.email });
        }
        if (user.given_name) {
          this.registrationForm.patchValue({ name: user.given_name });
        }
        if (user.family_name) {
          this.registrationForm.patchValue({ givenName: user.family_name });
        }
      }
    });
  }
  async changeAvatar() {
    console.log('changing avatar');
    this.image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    const safeImg = this.sanitizer.bypassSecurityTrustUrl(this.image.webPath);
    this.urlAvatar = safeImg;
  }
  //computed errorcontrol
  get errorControl() {
    return this.registrationForm.controls;
  }
  openTerritoryPopup() {
    this.alertService.presentAlert('registration.territoryPopup.header',
      'registration.territoryPopup.message',
      'modalConfirm');
  }
  openPrivacyPopup() {
    this.alertService.presentAlert('registration.privacyPopup.header',
      'registration.privacyPopup.message',
      'modalConfirm');
  }

  async registrationSubmit() {
    this.isSubmitted = true;
    if (!this.registrationForm.valid) {
      return false;
    } else {
      const res = await this.alertService.confirmAlert('registration.confirm.header',
        {
          key: 'registration.confirm.message', interpolateParams: {
            nickname: this.registrationForm.value.nickname,
            territory: (this.territoryList.find(territory => territory.territoryId === this.registrationForm.value.territoryId)).name
          }
        },
        'modalConfirm');
      if (res) {
        this.submitUser();
      }
    }
  }
  submitUser() {
    try {
      this.userService
        .registerPlayer(this.registrationForm.value)
        .then(async () => {
          if (!this.image) {
            await this.userService.uploadAvatar(
              await fetch('assets/images/registration/generic_user.png').then(
                (r) => r.blob()
              )
            );
          } else {
            await this.userService.uploadAvatar(
              await readAsBase64(this.image)
            );
          }
          this.userService.startService();
          this.navCtrl.navigateRoot('/pages/tabs/home');
        })
        .catch((error: any) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { TerritoryService } from 'src/app/core/shared/services/territory.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { readAsBase64 } from 'src/app/core/shared/utils';

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
    private errorService: ErrorService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private territoryService: TerritoryService,
    public formBuilder: FormBuilder,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer
  ) {
    this.territoryService.territories$.subscribe((territories) => {
      this.territoryList = territories;
    });
  }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
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

  async registrationSubmit() {
    this.isSubmitted = true;
    if (!this.registrationForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      console.log(this.registrationForm.value);
      //register user
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
            //restart the status and load the home
            this.userService.startService();
            this.navCtrl.navigateRoot('/pages/tabs/home');
          })
          .catch((error: any) => {
            // this.errorService.showAlert(error);
            console.log(error);
          });
      } catch (error) {
        // this.errorService.showAlert(error);
        console.log(error);
      }
    }
  }
}

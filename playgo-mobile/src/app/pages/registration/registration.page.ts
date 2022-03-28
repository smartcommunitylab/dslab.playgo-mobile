import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'src/app/core/territory/territory.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';
import { UserService } from 'src/app/core/user/user.service';
import { AlertService } from 'src/app/core/shared/services/alert.services';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/core/shared/services/error.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  territoryList = [];
  registrationForm: FormGroup;
  isSubmitted = false;
  urlAvatar: string | SafeUrl = 'assets/images/registration/generic_user.png';
  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private territoryService: TerritoryService,
    public formBuilder: FormBuilder,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer) {
    this.territoryService.territories$.subscribe((territories) => {
      this.territoryList = territories;
    });
  }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      mail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      nickname: ['', [Validators.required, Validators.minLength(2)]],
      language: ['', [Validators.required]],
      territoryId: ['', [Validators.required]]
    });
  }
  async changeAvatar() {
    console.log('changing avatar');
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });
    const safeImg = this.sanitizer.bypassSecurityTrustUrl(image.webPath);
    // const imageUrl = image.webPath;
    // Can be set to the src of an image now
    this.urlAvatar = safeImg;
  }
  //computed errorcontrol
  get errorControl() {
    return this.registrationForm.controls;
  }
  registrationSubmit() {
    this.isSubmitted = true;
    if (!this.registrationForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      console.log(this.registrationForm.value);
      //register user
      this.userService.registerPlayer(this.registrationForm.value).then(() => {
        this.navCtrl.navigateRoot('/pages/tabs/home');
      }).catch((error: any) => {
        this.errorService.showAlert(error);
      });
    }

  }
}

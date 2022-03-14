import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'src/app/core/territory/territory.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    private territoryService: TerritoryService,
    public formBuilder: FormBuilder,
    private sanitizer: DomSanitizer) {
    this.territoryService.territories$.subscribe((territories) => {
      this.territoryList = territories;
    });
  }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      mail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      nickname: ['', [Validators.required, Validators.minLength(2)]],
      language: ['', [Validators.required]],
      territory: ['', [Validators.required]]
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
    }

  }
}

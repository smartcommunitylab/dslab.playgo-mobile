import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'src/app/core/territory/territory.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  territoryList = [];
  registrationForm: FormGroup;
  isSubmitted = false;

  constructor(
    private territoryService: TerritoryService,
    public formBuilder: FormBuilder) {
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

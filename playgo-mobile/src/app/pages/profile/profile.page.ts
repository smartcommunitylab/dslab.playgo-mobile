import { Component } from '@angular/core';
import { UserClass } from 'src/app/shared/classes/user';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {


  user?: UserClass;

  constructor() {}

}

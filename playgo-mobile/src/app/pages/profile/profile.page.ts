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

  ngOnInit() {
    //todo call profile service
    this.user = new UserClass();
    this.user.img_source = "https://www.atuttodonna.it/atuttodonna/wp-content/uploads/2020/04/immagini-felicit%C3%A0.jpg";
    this.user.totalLeaf = "42";
    this.user.name = "My name";
  }
}

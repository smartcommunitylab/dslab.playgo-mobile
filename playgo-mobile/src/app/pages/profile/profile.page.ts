import { Component, OnInit } from '@angular/core';
import { UserClass } from 'src/app/core/shared/classes/user';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user?: UserClass;
  today = new Date();
  val = 111122222.3333;
  constructor() { }

  ngOnInit() {
    //todo call profile service
    this.user = new UserClass();
    this.user.img_source = 'https://www.atuttodonna.it/atuttodonna/wp-content/uploads/2020/04/immagini-felicit%C3%A0.jpg';
    this.user.totalLeaf = '42';
    this.user.name = 'My name';
  }
}

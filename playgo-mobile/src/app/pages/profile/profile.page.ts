import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit {

  today = new Date();
  val = 111122222.3333;
  constructor() { }

  ngOnInit() {
    //todo call profile service
  }
}

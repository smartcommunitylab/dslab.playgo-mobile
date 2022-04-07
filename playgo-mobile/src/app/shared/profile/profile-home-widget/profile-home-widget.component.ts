import { Component, Input, OnInit } from '@angular/core';
import { UserClass } from '../../classes/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-home-widget',
  templateUrl: './profile-home-widget.component.html',
  styleUrls: ['./profile-home-widget.component.scss'],
})
export class ProfileHomeWidgetComponent implements OnInit {

  accessProfile?: boolean;
  @Input() user?: UserClass;

  constructor(private router: Router) { }

  ngOnInit() {}

  accessProf(){
    this.router.navigateByUrl('/tabs/profile');
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivityClass } from 'src/app/core/shared/model/activity-class';

@Component({
  selector: 'app-my-activity',
  templateUrl: './my-activity.component.html',
  styleUrls: ['./my-activity.component.scss'],
})
export class MyActivityComponent implements OnInit {
  activities?: ActivityClass[];

  constructor() {}

  ngOnInit() {}
}

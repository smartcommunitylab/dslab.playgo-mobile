import { Component, OnInit } from '@angular/core';
import { ActivityClass } from 'src/app/shared/classes/activity-class';

@Component({
  selector: 'app-my-activity-widget',
  templateUrl: './my-activity-widget.component.html',
  styleUrls: ['./my-activity-widget.component.scss'],
})
export class MyActivityWidgetComponent implements OnInit {

  activities?: ActivityClass[];

  constructor() { }

  ngOnInit() {}

}

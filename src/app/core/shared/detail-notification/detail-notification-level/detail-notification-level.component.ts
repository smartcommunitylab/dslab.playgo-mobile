import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-notification-level',
  templateUrl: './detail-notification-level.component.html',
  styleUrls: ['./detail-notification-level.component.scss'],
  standalone: false,

})
export class DetailNotificationLevelComponent implements OnInit {
  @Input() notification: any;
  constructor() {}

  ngOnInit() {}
}

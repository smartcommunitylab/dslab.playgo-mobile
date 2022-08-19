import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-notification-badge',
  templateUrl: './detail-notification-badge.component.html',
  styleUrls: ['./detail-notification-badge.component.scss'],
})
export class DetailNotificationBadgeComponent implements OnInit {
  @Input() notification: any;
  constructor() {}

  ngOnInit() {}
}

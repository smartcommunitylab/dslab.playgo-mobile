import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { UserService } from 'src/app/core/shared/services/user.service';
import { TranslateKey } from 'src/app/core/shared/type.utils';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit {
  @Input()
  notification: Notification;

  constructor() {}

  ngOnInit() {
    console.log(this.notification);
  }
}

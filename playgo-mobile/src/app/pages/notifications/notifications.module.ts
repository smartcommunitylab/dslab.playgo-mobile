import { NgModule } from '@angular/core';
import { NotificationsPage } from './notifications.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';

@NgModule({
  imports: [PlayGoSharedModule, NotificationsPageRoutingModule],
  declarations: [NotificationsPage, NotificationDetailComponent],
})
export class NotificationsPageModule {}

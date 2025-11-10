import { NgModule } from '@angular/core';
import { NotificationsPage } from './notifications.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationDetailModalPage } from './notification-detail/notification-modal/notification.modal';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, NotificationsPageRoutingModule,IonicModule],
  declarations: [
    NotificationsPage,
    NotificationDetailComponent,
    NotificationDetailModalPage,
  ],
})
export class NotificationsPageModule {}

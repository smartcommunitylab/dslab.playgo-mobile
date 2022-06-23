import { NgModule } from '@angular/core';
import { NotificationsPage } from './notifications.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { NotificationsPageRoutingModule } from './notifications-routing.module';

@NgModule({
  imports: [PlayGoSharedModule, NotificationsPageRoutingModule],
  declarations: [NotificationsPage],
})
export class NotificationsPageModule {}

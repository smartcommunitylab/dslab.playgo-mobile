import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { MessageComponent } from '../../../core/shared/profile-components/message-component/message.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { MyActivityComponent } from 'src/app/core/shared/profile-components/my-activity-component/my-activity.component';
import { DeleteModalPage } from './delete-modal/deleteModal.component';

@NgModule({
  imports: [PlayGoSharedModule, ProfilePageRoutingModule],
  declarations: [
    MessageComponent,
    MyActivityComponent,
    ProfilePage,
    DeleteModalPage,
  ],
  exports: [MessageComponent, MyActivityComponent],
})
export class ProfilePageModule {}

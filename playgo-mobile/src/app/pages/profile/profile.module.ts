import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { MessageComponent } from '../../core/shared/profile-components/message-component/message.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { GeneralStatisticsComponent } from '../../core/shared/profile-components/general-statistics-component/general-statistics.component';
import { MyActivityComponent } from 'src/app/core/shared/profile-components/my-activity-component/my-activity.component';

@NgModule({
  imports: [
    PlayGoSharedModule,
    ProfilePageRoutingModule,
  ],
  declarations: [
    MessageComponent,
    GeneralStatisticsComponent,
    MyActivityComponent,
    ProfilePage],
  exports: [MessageComponent,
    MyActivityComponent,
    GeneralStatisticsComponent]
})
export class ProfilePageModule { }

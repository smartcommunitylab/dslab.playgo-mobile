import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';
import { MessageWidgetComponent } from './message-widget/message-widget.component';
import { GeneralStatisticsWidgetComponent } from './general-statistics-widget/general-statistics-widget.component';
import { MyActivityWidgetComponent } from './my-activity-widget/my-activity-widget.component';

@NgModule({
  imports: [
    PlayGoSharedModule,
    ProfilePageRoutingModule,
  ],
  declarations: [
    MessageWidgetComponent,
    GeneralStatisticsWidgetComponent,
    MyActivityWidgetComponent,
    ProfilePage],
    exports: [MessageWidgetComponent,
      MyActivityWidgetComponent,
      GeneralStatisticsWidgetComponent]
})
export class ProfilePageModule {}

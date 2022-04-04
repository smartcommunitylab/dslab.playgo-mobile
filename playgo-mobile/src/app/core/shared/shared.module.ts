import { NgModule } from '@angular/core';
import { HelloComponent } from './hello-component/hello.component';
import { ChangeProfileModalPage } from './profile/changeProfile.component';
import { ProfileComponent } from './profile/profile.component';
import { AlertService } from './services/alert.service';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TrackingModule } from './tracking/tracking.module';

@NgModule({
  imports: [PlayGoSharedLibsModule, TrackingModule],
  declarations: [HelloComponent, ProfileComponent, ChangeProfileModalPage],
  entryComponents: [],
  providers: [AlertService],
  exports: [
    PlayGoSharedLibsModule,
    HelloComponent,
    ProfileComponent,
    TrackingModule,
  ],
})
export class PlayGoSharedModule {}

import { NgModule } from '@angular/core';
import { HelloComponent } from './hello-component/hello.component';
import { LocalDatePipe } from './pipes/localDate.pipe';
import { LocalNumberPipe } from './pipes/localNumber.pipe';
import { ChangeProfileModalPage } from './profile/changeProfile.component';
import { ProfileComponent } from './profile/profile.component';
import { AlertService } from './services/alert.service';
import { LocalStorageRefService } from './services/local-storage-ref.service';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TrackingModule } from './tracking/tracking.module';

@NgModule({
  imports: [PlayGoSharedLibsModule, TrackingModule],
  declarations: [
    HelloComponent,
    ProfileComponent,
    ChangeProfileModalPage,
    LocalDatePipe,
    LocalNumberPipe,
  ],
  entryComponents: [],
  providers: [AlertService, LocalStorageRefService],
  exports: [
    PlayGoSharedLibsModule,
    HelloComponent,
    ProfileComponent,
    LocalDatePipe,
    LocalNumberPipe,
    TrackingModule,
  ],
})
export class PlayGoSharedModule {}

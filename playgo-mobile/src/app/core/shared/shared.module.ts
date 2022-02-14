import { NgModule } from '@angular/core';
import { HelloComponent } from './hello-component/hello.component';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TrackingMainControlComponent } from './tracking/tracking-main-control/tracking-main-control.component';
import { TrackingQuickControlComponent } from './tracking/tracking-quick-control/tracking-quick-control.component';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    HelloComponent,
    TrackingMainControlComponent,
    TrackingQuickControlComponent,
  ],
  entryComponents: [],
  exports: [
    PlayGoSharedLibsModule,
    HelloComponent,
    TrackingQuickControlComponent,
  ],
})
export class PlayGoSharedModule {}

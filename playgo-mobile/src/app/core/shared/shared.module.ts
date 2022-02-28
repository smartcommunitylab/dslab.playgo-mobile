import { NgModule } from '@angular/core';
import { HelloComponent } from './hello-component/hello.component';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TrackingModule } from './tracking/tracking.module';

@NgModule({
  imports: [PlayGoSharedLibsModule, TrackingModule],
  declarations: [HelloComponent],
  entryComponents: [],
  exports: [PlayGoSharedLibsModule, HelloComponent, TrackingModule],
})
export class PlayGoSharedModule {}

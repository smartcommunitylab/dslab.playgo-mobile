import { NgModule } from '@angular/core';
import { HelloComponent } from './hello/hello.component';
import { PlayGoSharedLibsModule } from './shared-libs.module';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    HelloComponent
  ],
  entryComponents: [],
  exports: [
    PlayGoSharedLibsModule,
    HelloComponent
  ]
})
export class PlayGoSharedModule {}

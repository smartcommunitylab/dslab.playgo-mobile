import { NgModule } from '@angular/core';
import { CampaignCardComponent } from './campaigns/campaign-card/campaign-card.component';
import { HelloComponent } from './hello-component/hello.component';
import { ProfileHomeWidgetComponent } from './profile/profile-home-widget/profile-home-widget.component';
import { PlayGoSharedLibsModule } from './shared-libs.module';

@NgModule({
  imports: [PlayGoSharedLibsModule,],
  declarations: [
    CampaignCardComponent,
    HelloComponent,
    ProfileHomeWidgetComponent
  ],
  entryComponents: [],
  exports: [
    PlayGoSharedLibsModule,
    CampaignCardComponent,
    HelloComponent,
    ProfileHomeWidgetComponent
  ]
})
export class PlayGoSharedModule {}

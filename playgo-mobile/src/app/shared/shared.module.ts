import { NgModule } from '@angular/core';
import { CampaignCardComponent } from './campaigns/campaign-card/campaign-card.component';
import { CampaignClass } from './campaigns/classes/campaign-class';
import { ContentPagable } from './campaigns/classes/content-pagable';
import { UserClass } from './classes/user';
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
    CampaignClass,
    UserClass,
    ProfileHomeWidgetComponent,
    ContentPagable
  ]
})
export class PlayGoSharedModule {}

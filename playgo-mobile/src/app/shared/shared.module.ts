import { NgModule } from '@angular/core';
import { CampaignCardComponent } from './campaigns/campaign-card/campaign-card.component';
import { CampaignClass } from './campaigns/classes/campaign-class';
import { ContentPagable } from './campaigns/classes/content-pagable';
import { HelloComponent } from './hello/hello.component';
import { PlayGoSharedLibsModule } from './shared-libs.module';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    HelloComponent,
    CampaignCardComponent
  ],
  entryComponents: [],
  exports: [
    PlayGoSharedLibsModule,
    HelloComponent,
    CampaignCardComponent,
    CampaignClass,
    ContentPagable
  ]
})
export class PlayGoSharedModule {}

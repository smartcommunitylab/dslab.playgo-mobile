import { NgModule } from '@angular/core';
import { CampaignCardComponent } from './campaigns/campaign-card/campaign-card.component';
import { CampaignClass } from './campaigns/classes/campaign-class';
import { ContentPagable } from './campaigns/classes/content-pagable';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TabComponent } from './tab/tab.component';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    CampaignCardComponent,
    TabComponent
  ],
  entryComponents: [],
  exports: [
    PlayGoSharedLibsModule,
    CampaignCardComponent,
    CampaignClass,
    ContentPagable,
    TabComponent
  ]
})
export class PlayGoSharedModule {}

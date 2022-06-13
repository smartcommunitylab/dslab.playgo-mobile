import { NgModule } from '@angular/core';
import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TrackingModule } from 'src/app/core/shared/tracking/tracking.module';

@NgModule({
  imports: [PlayGoSharedModule, TabsPageRoutingModule, TrackingModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}

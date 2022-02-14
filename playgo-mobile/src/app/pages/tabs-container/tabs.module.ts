import { NgModule } from '@angular/core';
import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    PlayGoSharedModule,
    TabsPageRoutingModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}

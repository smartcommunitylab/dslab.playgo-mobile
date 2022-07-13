import { NgModule } from '@angular/core';

import { OfflinePageRoutingModule } from './offline-routing.module';

import { OfflinePage } from './offline.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [OfflinePageRoutingModule, PlayGoSharedModule],
  declarations: [OfflinePage],
})
export class OfflinePageModule {}

import { NgModule } from '@angular/core';

import { OfflinePageRoutingModule } from './offline-routing.module';

import { OfflinePage } from './offline.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [OfflinePageRoutingModule, PlayGoSharedModule,IonicModule],
  declarations: [OfflinePage],
})
export class OfflinePageModule {}

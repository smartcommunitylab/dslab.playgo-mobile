import { NgModule } from '@angular/core';
import { BlacklistPageRoutingModule } from './blacklist-routing.module';
import { BlacklistPage } from './blacklist.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, BlacklistPageRoutingModule, IonicModule],
  declarations: [BlacklistPage],
})
export class BlacklistPageModule {}

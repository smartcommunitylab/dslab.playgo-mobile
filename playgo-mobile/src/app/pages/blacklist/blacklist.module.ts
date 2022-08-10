import { NgModule } from '@angular/core';
import { BlacklistPageRoutingModule } from './blacklist-routing.module';
import { BlacklistPage } from './blacklist.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, BlacklistPageRoutingModule],
  declarations: [BlacklistPage],
})
export class BlacklistPageModule {}

import { NgModule } from '@angular/core';
import { BadgesPageRoutingModule } from './badges-routing.module';
import { BadgesPage } from './badges.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, BadgesPageRoutingModule],
  declarations: [BadgesPage],
})
export class BadgesPageModule {}

import { NgModule } from '@angular/core';
import { BadgesPageRoutingModule } from './badges-routing.module';
import { BadgesPage } from './badges.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { BadgeComponent } from './badge/badge.component';

@NgModule({
  imports: [PlayGoSharedModule, BadgesPageRoutingModule],
  declarations: [BadgesPage, BadgeComponent],
})
export class BadgesPageModule {}

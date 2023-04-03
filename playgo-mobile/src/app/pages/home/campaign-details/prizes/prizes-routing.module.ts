import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { PrizesPage } from './prizes.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: PrizesPage,
    data: {
      title: 'campaigns.detail.prizes',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrizesPageRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { FaqPage } from './faq.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: FaqPage,
    data: {
      title: 'campaigns.detail.faq',
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqPageRoutingModule { }

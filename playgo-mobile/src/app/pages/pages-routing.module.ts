import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
      }
    ])
  ]
})
export class PagesRoutingModule {}

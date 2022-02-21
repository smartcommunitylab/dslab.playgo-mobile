import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuardService } from '../shared/auth/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        loadChildren: () => import('./tabs-container/tabs.module').then(m => m.TabsPageModule),
      }
    ])
  ]
})
export class PagesRoutingModule { }

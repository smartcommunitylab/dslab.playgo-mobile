import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EndSessionPage } from './end-session.page';
import { PlayGoSharedLibsModule } from 'src/app/core/shared/shared-libs.module';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: EndSessionPage,
    data: {
      title: 'login.labelSignout',
    },
  },
];

@NgModule({
  imports: [PlayGoSharedLibsModule, RouterModule.forChild(routes)],
  declarations: [EndSessionPage],
})
export class EndSessionPageModule {}

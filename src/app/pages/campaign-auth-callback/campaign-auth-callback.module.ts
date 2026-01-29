import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayGoSharedLibsModule } from 'src/app/core/shared/shared-libs.module';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { AuthCallbackPage } from 'src/app/auth-pages/auth-callback/auth-callback.page';
import { CampaignAuthCallbackPage } from './campaign-auth-callback.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CampaignAuthCallbackPage,
    data: {
      title: 'login.labelSignin',
    },
  },
];

@NgModule({
  imports: [PlayGoSharedLibsModule, IonicModule,RouterModule.forChild(routes)],
  declarations: [CampaignAuthCallbackPage],
})
export class CampaignAuthCallbackModule {}

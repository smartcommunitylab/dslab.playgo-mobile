import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';
import { PlayGoSharedLibsModule } from 'src/app/core/shared/shared-libs.module';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: LoginPage,
    data: {
      title: 'login.login_page_title',
    },
  },
];

@NgModule({
  imports: [PlayGoSharedLibsModule, RouterModule.forChild(routes)],
  declarations: [LoginPage],
})
export class LoginPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EndSessionPage } from './end-session.page';
import { TranslateModule } from '@ngx-translate/core';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: EndSessionPage
  }
];

@NgModule({
  imports: [
    PlayGoSharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EndSessionPage]
})
export class EndSessionPageModule {}

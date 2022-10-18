import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [TranslateModule],
  exports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicSelectableModule,
  ],
})
export class PlayGoSharedLibsModule {}

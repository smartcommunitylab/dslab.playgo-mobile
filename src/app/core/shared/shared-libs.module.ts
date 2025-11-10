import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableComponent } from 'ionic-selectable';

@NgModule({
  imports: [TranslateModule, IonicSelectableComponent,IonicModule],
  exports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicSelectableComponent
  ]
})
export class PlayGoSharedLibsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonicSelectableComponent,
  IonicSelectableItemTemplateDirective,
  IonicSelectableValueTemplateDirective,
  IonicSelectableCloseButtonTemplateDirective,
  IonicSelectableTitleTemplateDirective
} from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    // 👇 importa standalone components con .import() (Angular 15+)
    IonicSelectableComponent,
    IonicSelectableItemTemplateDirective,
    IonicSelectableValueTemplateDirective,
    IonicSelectableCloseButtonTemplateDirective,
    IonicSelectableTitleTemplateDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    IonicSelectableComponent,
    IonicSelectableItemTemplateDirective,
    IonicSelectableValueTemplateDirective,
    IonicSelectableCloseButtonTemplateDirective,
    IonicSelectableTitleTemplateDirective,
  ],
})
export class PlayGoSharedLibsModule {}

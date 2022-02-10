import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from '../app-routing.module';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports:[
    TranslateModule
  ],
  exports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule
  ]
})
export class PlayGoSharedLibsModule {}

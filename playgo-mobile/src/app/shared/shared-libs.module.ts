import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModule } from './auth/auth.module';

@NgModule({
  imports:[
    TranslateModule,
    AuthModule
  ],
  exports: [
    AuthModule,
    FormsModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule
  ]
})
export class PlayGoSharedLibsModule {}

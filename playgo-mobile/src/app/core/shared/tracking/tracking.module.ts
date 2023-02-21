import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingMainControlComponent } from './tracking-main-control/tracking-main-control.component';
import { PlayGoSharedLibsModule } from '../shared-libs.module';
import { TrackingButtonsComponent } from './tracking-buttons/tracking-buttons.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CarpoolingRoleDialogComponent } from './carpooling/carpooling-role-dialog';
import { QRCodeModule } from 'angularx-qrcode';
import { CarpoolingShowQRDialogComponent } from './carpooling/carpooling-show-qr-dialog/carpooling-show-qr-dialog.component';
import { CarpoolingScanQRDialogComponent } from './carpooling/carpooling-scan-qr-dialog/carpooling-scan-qr-dialog.component';
import { MapComponent } from './map/map/map.component';
import { CurrentLocationMapControlComponent } from './map/current-location-map-control/current-location-map-control.component';
import { TrackingStopwatchComponent } from './tracking-stopwatch/tracking-stopwatch.component';
import { PlayGoSharedModule } from '../shared.module';
import { FirstTimeBackgrounModalPage } from './first-time-modal/first-time.modal';
import { InfoTrackingModalPage } from './tracking-main-control/info-tracking-modal/info-tracking.modal';

@NgModule({
  declarations: [
    TrackingMainControlComponent,
    TrackingButtonsComponent,
    TrackingStopwatchComponent,
    InfoTrackingModalPage,
    MapComponent,
    CurrentLocationMapControlComponent,
    CarpoolingRoleDialogComponent,
    CarpoolingShowQRDialogComponent,
    CarpoolingScanQRDialogComponent,
    FirstTimeBackgrounModalPage,
  ],
  providers: [],
  imports: [CommonModule, PlayGoSharedModule, LeafletModule, QRCodeModule],
  exports: [TrackingMainControlComponent],
})
export class TrackingModule { }

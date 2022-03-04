import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingMainControlComponent } from './tracking-main-control/tracking-main-control.component';
import { TrackingQuickControlComponent } from './tracking-quick-control/tracking-quick-control.component';
import { BackgroundTrackingService } from './background-tracking.service';
import { TripPersistanceService } from './trip-persistance.service';
import { TripService } from './trip.service';
import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation';
import { BackgroundGeolocationMock } from './BackgroundGeolocationMock';
import { Platform } from '@ionic/angular';
import { PlayGoSharedLibsModule } from '../shared-libs.module';
import { TrackingButtonsComponent } from './tracking-buttons/tracking-buttons.component';
import { MapComponent } from './map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CarpoolingRoleDialogComponent } from './carpooling/carpooling-role-dialog';
import { QRCodeModule } from 'angularx-qrcode';
import { CarpoolingShowQRDialogComponent } from './carpooling/carpooling-show-qr-dialog/carpooling-show-qr-dialog.component';
import { CarpoolingScanQRDialogComponent } from './carpooling/carpooling-scan-qr-dialog/carpooling-scan-qr-dialog.component';

@NgModule({
  declarations: [
    TrackingMainControlComponent,
    TrackingQuickControlComponent,
    TrackingButtonsComponent,
    MapComponent,
    CarpoolingRoleDialogComponent,
    CarpoolingShowQRDialogComponent,
    CarpoolingScanQRDialogComponent,
  ],
  providers: [
    // { provide: BackgroundGeolocation, useValue: BackgroundGeolocation },
    {
      provide: BackgroundGeolocation,
      useFactory: (platform: Platform) =>
        platform.is('desktop')
          ? // FIXME: only debug!
            BackgroundGeolocationMock
          : BackgroundGeolocation,
      deps: [Platform],
    },
  ],
  imports: [CommonModule, PlayGoSharedLibsModule, LeafletModule, QRCodeModule],
  exports: [
    TrackingMainControlComponent,
    TrackingQuickControlComponent,
    MapComponent,
  ],
})
export class TrackingModule {}

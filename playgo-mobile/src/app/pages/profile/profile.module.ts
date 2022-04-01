import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { MessageComponent } from '../../core/shared/profile-components/message-component/message.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { GeneralStatisticsComponent } from '../../core/shared/profile-components/general-statistics-component/general-statistics.component';
import { MyActivityComponent } from 'src/app/core/shared/profile-components/my-activity-component/my-activity.component';
import { TripsPage } from './trips/trips.page';
import { TripDetailPage } from './trip-detail/trip-detail.page';
import { TripDetailMapComponent } from './trip-detail-map/trip-detail-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  imports: [PlayGoSharedModule, ProfilePageRoutingModule, LeafletModule],
  declarations: [
    MessageComponent,
    GeneralStatisticsComponent,
    MyActivityComponent,
    ProfilePage,
    TripsPage,
    TripDetailPage,
    TripDetailMapComponent,
  ],
  exports: [MessageComponent, MyActivityComponent, GeneralStatisticsComponent],
})
export class ProfilePageModule {}

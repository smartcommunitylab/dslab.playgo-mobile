/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CampaignCardComponent } from './campaigns/campaign-card/campaign-card.component';
import { LocalDatePipe } from './pipes/localDate.pipe';
import { LocalNumberPipe } from './pipes/localNumber.pipe';
import { ChangeProfileModalPage } from './profile-components/change-profile-component/changeProfile.component';
import { SingleMeanStatisticComponent } from './profile-components/general-statistics-component/single-mean-statistic-component/single-mean-statistic.component';
import { TotalStatisticsComponent } from './profile-components/general-statistics-component/total-statistics-component/total-statistics.component';
import { ProfileComponent } from './profile-components/profile-component/profile.component';
import { AlertService } from './services/alert.service';
import { LocalStorageRefService } from './services/local-storage-ref.service';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import { TrackingModule } from './tracking/tracking.module';

@NgModule({
  imports: [PlayGoSharedLibsModule, TrackingModule],
  declarations: [
    CampaignCardComponent,
    ProfileComponent,
    ChangeProfileModalPage,
    SingleMeanStatisticComponent,
    TotalStatisticsComponent,
    LocalDatePipe,
    LocalNumberPipe,
  ],
  entryComponents: [],
  providers: [AlertService, LocalStorageRefService],
  exports: [
    PlayGoSharedLibsModule,
    CampaignCardComponent,
    ProfileComponent,
    LocalDatePipe,
    SingleMeanStatisticComponent,
    TotalStatisticsComponent,
    LocalNumberPipe,
    TrackingModule,
  ],
})
export class PlayGoSharedModule {}

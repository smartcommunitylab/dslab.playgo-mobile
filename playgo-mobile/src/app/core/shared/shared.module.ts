/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { MyCampaignCardComponent } from './campaigns/my-campaign-card/my-campaign-card.component';
import { PublicCampaignCardComponent } from './campaigns/public-campaign-card/public-campaign-card.component';
import { LocalDatePipe } from './pipes/localDate.pipe';
import { LocalNumberPipe } from './pipes/localNumber.pipe';
import { ProfileComponent } from './profile-components/profile-component/profile.component';
import { AlertService } from './services/alert.service';
import { LocalStorageRefService } from './services/local-storage-ref.service';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import {
  InfiniteScrollComponent,
  InfiniteScrollContentDirective,
} from './infinite-scroll/infinite-scroll.component';
import { HeaderComponent } from './layout/header/header.component';
import { OrdinalNumberComponent } from './globalization/ordinal-number/ordinal-number.component';
import { MainCampaignStatComponent } from './campaigns/main-campaign-stat/main-campaign-stat.component';
import { PrivacyModalPage } from 'src/app/pages/home/profile/privacy-modal/privacyModal.component';
import { ParallaxDirective } from './directives/parallax-header.directive';
import { HomeCampaignCityComponent } from './campaigns/home-widget-types/home-campaign-city/home-campaign-city.component';
import { HomeCampaignSchoolComponent } from './campaigns/home-widget-types/home-campaign-school/home-campaign-school.component';
import { HomeCampaignCompanyComponent } from './campaigns/home-widget-types/home-campaign-company/home-campaign-company.component';
import { HomeCampaignPersonalComponent } from './campaigns/home-widget-types/home-campaign-personal/home-campaign-personal.component';
import { WidgetComponent } from './campaigns/app-widget-campaign/app-widget-campaign.component';
import { IconComponent } from './ui/icon/icon.component';
import { GameStatusComponent } from './campaigns/main-campaign-stat/game-status/game-status.component';
import { RecordStatusComponent } from './campaigns/main-campaign-stat/record-status/record-status.component';
import { LanguageMapPipe } from './pipes/languageMap.pipe';
import { DetailNotificationModalPage } from './detail-notification/detail-notification.modal';
import { NotificationBadgeComponent } from './campaigns/home-widget-types/notification-badge/notification-badge.component';
import { SafeHtmlPipe } from './pipes/SafeHtml.pipe';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    MyCampaignCardComponent,
    MainCampaignStatComponent,
    PublicCampaignCardComponent,
    HeaderComponent,
    ProfileComponent,
    PrivacyModalPage,
    DetailNotificationModalPage,
    LocalDatePipe,
    LocalNumberPipe,
    SafeHtmlPipe,
    LanguageMapPipe,
    InfiniteScrollComponent,
    InfiniteScrollContentDirective,
    ParallaxDirective,
    OrdinalNumberComponent,
    HomeCampaignCityComponent,
    HomeCampaignSchoolComponent,
    HomeCampaignCompanyComponent,
    HomeCampaignPersonalComponent,
    NotificationBadgeComponent,
    RecordStatusComponent,
    GameStatusComponent,
    WidgetComponent,
    IconComponent,
  ],
  entryComponents: [],
  providers: [AlertService, LocalStorageRefService],
  exports: [
    PlayGoSharedLibsModule,
    MyCampaignCardComponent,
    MainCampaignStatComponent,
    PublicCampaignCardComponent,
    ProfileComponent,
    PrivacyModalPage,
    DetailNotificationModalPage,
    LocalDatePipe,
    LanguageMapPipe,
    HeaderComponent,
    LocalNumberPipe,
    SafeHtmlPipe,
    InfiniteScrollComponent,
    InfiniteScrollContentDirective,
    ParallaxDirective,
    OrdinalNumberComponent,
    HomeCampaignCityComponent,
    HomeCampaignSchoolComponent,
    HomeCampaignCompanyComponent,
    HomeCampaignPersonalComponent,
    NotificationBadgeComponent,
    GameStatusComponent,
    RecordStatusComponent,
    WidgetComponent,
    IconComponent,
  ],
})
export class PlayGoSharedModule {}

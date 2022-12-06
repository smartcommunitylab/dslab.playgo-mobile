/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { MyCampaignCardComponent } from './campaigns/my-campaign-card/my-campaign-card.component';
import { PublicCampaignCardComponent } from './campaigns/public-campaign-card/public-campaign-card.component';
import { LocalDatePipe } from './pipes/localDate.pipe';
import { LocalNumberPipe } from './pipes/localNumber.pipe';
import { ProfileComponent } from './profile-components/profile-component/profile.component';
import { AlertService } from './services/alert.service';
import { PlayGoSharedLibsModule } from './shared-libs.module';
import {
  InfiniteScrollComponent,
  InfiniteScrollContentDirective,
} from './infinite-scroll/infinite-scroll.component';
import { HeaderContentComponent } from './layout/header/header-content.component';
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
import { DetailNotificationLevelComponent } from './detail-notification/detail-notification-level/detail-notification-level.component';
import { DetailNotificationBadgeComponent } from './detail-notification/detail-notification-badge/detail-notification-badge.component';
import { NotificationBadgeComponent } from './campaigns/home-widget-types/notification-badge/notification-badge.component';
import { SafeHtmlPipe } from './pipes/SafeHtml.pipe';
import { HomeCampaignChallengeComponent } from './campaigns/app-widget-campaign/app-home-campaign-challenges/app-home-campaign-challenges.component';
import { HeaderDirective } from './layout/header/header.directive';
import { ActiveChallengeComponent } from './campaigns/app-widget-campaign/active-challenge/active-challenge.component';
import { ChallengeUsersStatusComponent } from './campaigns/challenge-users-status/challenge-users-status.component';
import { ChallengeBarStatusComponent } from './campaigns/challenge-bar-status/challenge-bar-status.component';
import { LimitStatusComponent } from './campaigns/main-campaign-stat/limit-status/limit-status.component';
import { NotificationModalPage } from './notification-modal/notification.modal';
import { ContentContentComponent } from './layout/content/content-content.component';
import { ContentDirective } from './layout/content/content.directive';
import { CompanyLabelComponent } from './campaigns/app-company-label/app-company-label.component';
import { LimitModalPage } from './campaigns/main-campaign-stat/limit-status/limit-modal/limit.modal';
import { CompanyModalPage } from './campaigns/app-company-label/company-modal/company.modal';
import { HomeSchoolProfiloComponent } from './campaigns/home-widget-types/home-campaign-school/home-school-profile/home-school-profile.component';
import { HomeSchoolProgressionComponent } from './campaigns/home-widget-types/home-campaign-school/home-school-progression/home-school-progression.component';
import { ComparisonModalPage } from './campaigns/home-widget-types/home-campaign-school/home-school-progression/comparison-modal/comparison.modal';

@NgModule({
  imports: [PlayGoSharedLibsModule],
  declarations: [
    MyCampaignCardComponent,
    MainCampaignStatComponent,
    PublicCampaignCardComponent,
    HeaderContentComponent,
    HeaderDirective,
    ContentContentComponent,
    ContentDirective,
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
    ComparisonModalPage,
    HomeCampaignCityComponent,
    HomeSchoolProfiloComponent,
    HomeSchoolProgressionComponent,
    HomeCampaignSchoolComponent,
    HomeCampaignCompanyComponent,
    HomeCampaignPersonalComponent,
    NotificationBadgeComponent,
    RecordStatusComponent,
    GameStatusComponent,
    WidgetComponent,
    IconComponent,
    HomeCampaignChallengeComponent,
    ActiveChallengeComponent,
    ChallengeUsersStatusComponent,
    ChallengeBarStatusComponent,
    DetailNotificationLevelComponent,
    DetailNotificationBadgeComponent,
    LimitStatusComponent,
    NotificationModalPage,
    CompanyLabelComponent,
    LimitModalPage,
    CompanyModalPage
  ],
  entryComponents: [],
  providers: [AlertService],
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
    HeaderContentComponent,
    HeaderDirective,
    ContentContentComponent,
    ContentDirective,
    LocalNumberPipe,
    SafeHtmlPipe,
    InfiniteScrollComponent,
    InfiniteScrollContentDirective,
    ParallaxDirective,
    OrdinalNumberComponent,
    ComparisonModalPage,
    HomeCampaignCityComponent,
    HomeSchoolProfiloComponent,
    HomeSchoolProgressionComponent,
    HomeCampaignSchoolComponent,
    HomeCampaignCompanyComponent,
    HomeCampaignPersonalComponent,
    NotificationBadgeComponent,
    GameStatusComponent,
    RecordStatusComponent,
    WidgetComponent,
    IconComponent,
    HomeCampaignChallengeComponent,
    ActiveChallengeComponent,
    ChallengeUsersStatusComponent,
    ChallengeBarStatusComponent,
    DetailNotificationLevelComponent,
    DetailNotificationBadgeComponent,
    LimitStatusComponent,
    NotificationModalPage,
    CompanyLabelComponent,
    LimitModalPage,
    CompanyModalPage
  ],
})
export class PlayGoSharedModule { }

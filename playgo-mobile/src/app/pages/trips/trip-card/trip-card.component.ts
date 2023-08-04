/* eslint-disable no-underscore-dangle */
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { first, flatMap, last } from 'lodash-es';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  getTransportTypeIcon,
  getTransportTypeLabel,
} from 'src/app/core/shared/tracking/trip.model';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { ServerOrLocalTrip } from '../trips.page';
import { formatDurationToHoursAndMinutes } from 'src/app/core/shared/utils';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
})
export class TripCardComponent implements OnInit, OnChanges {
  getTransportTypeLabel = getTransportTypeLabel;
  getTransportTypeIcon = getTransportTypeIcon;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly Validity = TrackedInstanceInfo.ValidityEnum;

  @Input() trip: ServerOrLocalTrip;
  @Input() isOneDayTrip = true;
  @Input() multiModalTrip = false;
  @Input() indexTrip: number;
  @Input() length: number;

  validCampaignsLabel = '';
  durationLabel = '';

  noMonthOrYearFormat: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  constructor(
    private navController: NavController,
    private translateService: TranslateService,
    private userService: UserService
  ) { }

  openDetail() {
    if (this.isLocal(this.trip)) {
      return;
    }
    this.navController.navigateForward([
      '/pages/tabs/trips/trip/',
      this.trip.trackedInstanceId,
    ]);
  }

  isLocal(trip: ServerOrLocalTrip): boolean {
    return trip.status === 'NOT_SYNCHRONIZED' || trip.status === 'ONGOING';
  }
  oneCampaignUnassigned(trip: ServerOrLocalTrip): boolean {
    return trip.campaigns?.some(campaign => campaign.scoreStatus === 'UNASSIGNED');
  }
  ngOnInit() {
    if (!this.trip) {
      throw new Error('Trip is not defined');
    }
  }
  async ngOnChanges() {
    this.durationLabel = formatDurationToHoursAndMinutes(
      this.trip.endTime - this.trip.startTime
    );

    this.validCampaignsLabel = await this.getCampaignsLabel();
  }
  async getCampaignsLabel(): Promise<string> {
    const numberOfValidCampaigns = this.trip.campaigns.filter(
      (campaign) => campaign.valid
    ).length;

    const pluralRules = await firstValueFrom(this.userService.pluralRules$);
    const pluralForm = pluralRules.select(numberOfValidCampaigns);
    const translated: string = await firstValueFrom(
      this.translateService.get(
        'trip_detail.valid_for_campaigns.plural_form.' + pluralForm,
        { count: numberOfValidCampaigns }
      )
    );
    return translated;
  }
}

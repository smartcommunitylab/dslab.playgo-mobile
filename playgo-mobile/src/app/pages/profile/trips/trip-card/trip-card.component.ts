/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { first, flatMap, last } from 'lodash-es';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  TransportType,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { TripCampaign, TripInfo } from '../trips.page';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
})
export class TripCardComponent implements OnInit {
  transportTypeLabels = transportTypeLabels;
  pluralRules = new Intl.PluralRules(this.user.locale);

  @Input()
  set multiTrip(multiTrip: TripInfo[]) {
    this._multiTrip = multiTrip;

    // derived from Input
    this.campaignsLabels = flatMap(multiTrip, (trip) => trip.campaigns).map(
      (campaign) => {
        const pluralForm = this.pluralRules.select(campaign.score);
        const label = this.translateService.instant(
          'trip_detail.gl_per_campaign.plural_form_' + pluralForm,
          campaign
        );
        return label;
      }
    );
    this.modeTypesList = multiTrip
      .filter((trip) => trip.modeType)
      .map((trip) => {
        const modeType = trip.modeType;
        const modeTypeTranslated = this.translateService.instant(
          transportTypeLabels[modeType]
        );
        return modeTypeTranslated;
      })
      .join(', ');
    this.start = first(multiTrip).startTime;
    this.end = last(multiTrip).endTime;
    this.distance = multiTrip.reduce((acc, trip) => acc + trip.distance, 0);
    this.isOneDayTrip =
      new Date(this.start).toDateString() === new Date(this.end).toDateString();
  }
  get multiTrip(): TripInfo[] {
    return this._multiTrip;
  }
  private _multiTrip: TripInfo[];

  campaignsLabels: string[] = [];
  modeTypesList = '';
  start: number = null;
  end: number = null;
  distance: number = null;
  isOneDayTrip = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private user: UserService
  ) {}

  openDetail() {
    // TODO: change to multimodalId
    this.router.navigate(
      ['../trip-detail', this.multiTrip[0].trackedInstanceId],
      {
        relativeTo: this.route,
      }
    );
  }

  ngOnInit() {}
}

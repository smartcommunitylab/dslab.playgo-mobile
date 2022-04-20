/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { first, flatMap, last } from 'lodash-es';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  TransportType,
  transportTypeIcons,
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
  transportTypeIcons = transportTypeIcons;

  pluralRules = new Intl.PluralRules(this.user.locale);

  @Input() trip: TripInfo;
  @Input() isOneDayTrip = true;
  @Input() multiModalTrip = false;

  campaignsLabels: string[] = [];
  modeTypesList = '';
  start: number = null;
  end: number = null;
  distance: number = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private user: UserService
  ) {}

  openDetail() {
    this.router.navigate(['../trip-detail', this.trip.trackedInstanceId], {
      relativeTo: this.route,
    });
  }

  ngOnInit() {
    if (!this.trip) {
      throw new Error('Trip is not defined');
    }
    // derived from Inputs
    this.campaignsLabels = this.trip.campaigns.map((campaign) => {
      const pluralForm = this.pluralRules.select(campaign.score);
      const label = this.translateService.instant(
        'trip_detail.gl_per_campaign.plural_form_' + pluralForm,
        campaign
      );
      return label;
    });
  }
}

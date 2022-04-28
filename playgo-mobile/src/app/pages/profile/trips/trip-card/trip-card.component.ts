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
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { ServerOrLocalTrip } from '../trips.page';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
})
export class TripCardComponent implements OnInit {
  transportTypeLabels = transportTypeLabels;
  transportTypeIcons = transportTypeIcons;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly Validity = TrackedInstanceInfo.ValidityEnum;

  pluralRules = new Intl.PluralRules(this.user.locale);

  @Input() trip: ServerOrLocalTrip;
  @Input() isOneDayTrip = true;
  @Input() multiModalTrip = false;

  campaignsLabels: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private user: UserService
  ) {}

  openDetail() {
    if (this.trip.isLocal) {
      return;
    }
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

/* eslint-disable no-underscore-dangle */
import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
export class TripCardComponent implements OnInit, OnChanges {
  simpleId = simpleId;
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
    if (this.isLocal(this.trip)) {
      return;
    }
    this.router.navigate([this.trip.trackedInstanceId], {
      relativeTo: this.route,
    });
  }

  isLocal(trip: ServerOrLocalTrip): boolean {
    return trip.status === 'NOT_SYNCHRONIZED' || trip.status === 'ONGOING';
  }

  ngOnInit() {
    if (!this.trip) {
      throw new Error('Trip is not defined');
    }
  }
  ngOnChanges() {
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

const idMap = new Map<any, number>();
function simpleId(realId: string) {
  if (!idMap.has(realId)) {
    idMap.set(realId, idMap.size);
  }
  return 'id_' + idMap.get(realId);
}

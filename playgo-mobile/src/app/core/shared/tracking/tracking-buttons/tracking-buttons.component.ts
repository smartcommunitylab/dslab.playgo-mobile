import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import {
  TransportType,
  transportTypeIcons,
  transportTypes,
} from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-buttons',
  templateUrl: './tracking-buttons.component.html',
  styleUrls: ['./tracking-buttons.component.scss'],
})
export class TrackingButtonsComponent implements OnInit {
  @Input()
  fabListActive = false;
  @Output()
  fabListActivated = new EventEmitter<boolean>();

  public transportTypeOptions$: Observable<
    {
      transportType: TransportType;
      icon: string;
    }[]
  > = this.userService.userProfileMeans$.pipe(
    map((userProfileMeans) =>
      transportTypes
        .filter((transportType) => userProfileMeans.includes(transportType))
        .map((transportType) => ({
          transportType,
          icon: transportTypeIcons[transportType],
        }))
    )
  );

  constructor(
    public tripService: TripService,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  toggleFabList() {
    // I do not know why this is necessary...  maybe related to https://github.com/ionic-team/ionic-framework/issues/19361
    // but it looks like bug in ionic.
    setTimeout(() => {
      this.fabListActive = !this.fabListActive;
      // console.log('toggleFabList', this.fabListActive);
      this.changeDetectorRef.detectChanges();
      this.fabListActivated.emit(this.fabListActive);
    }, 0);
  }

  ngOnInit() {}
}

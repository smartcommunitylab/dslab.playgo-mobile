import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  map,
  distinctUntilChanged,
  switchMap,
  shareReplay,
  Observable,
  catchError,
} from 'rxjs';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { trackByProperty } from 'src/app/core/shared/utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-school-leaderboard',
  templateUrl: './school-leaderboard.page.html',
  styleUrls: ['./school-leaderboard.page.scss'],
})
export class SchoolLeaderboardPage implements OnInit {
  private campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public leaderboard$: Observable<SchoolPlacing[]> = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.getLeaderboard(campaignId).pipe(this.errorService.getErrorHandler())
    ),
    shareReplay(1)
  );

  placingTracking = trackByProperty<SchoolPlacing>('id');

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private errorService: ErrorService
  ) {}

  ngOnInit() {}

  private getLeaderboard(campaignId: string) {
    return this.http.get<SchoolPlacing[]>(
      `${environment.serverUrl.hscApi}/${campaignId}/board`
    );
  }
}

interface SchoolPlacing {
  id: string;
  score: number;
  position: number;
  customData: {
    institute: string;
    school: string;
    cls: string;
  };
}

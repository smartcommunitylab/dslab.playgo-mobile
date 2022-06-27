import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import { EMPTY, merge, Observable, ReplaySubject, throwError } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  tap,
  shareReplay,
  startWith,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CampaignControllerService } from '../../api/generated/controllers/campaignController.service';
import { Campaign } from '../../api/generated/model/campaign';
import { CampaignSubscription } from '../../api/generated/model/campaignSubscription';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { IUser } from '../model/user.model';
import { LocalStorageService } from './local-storage.service';
import { UserService } from './user.service';
import { ifOfflineUseStored } from '../utils';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private initialUserProfile$: Observable<IUser> =
    this.userService.userProfile$.pipe(
      filter((profile) => profile !== null),
      first()
    );

  public allCampaigns$: Observable<Campaign[]> = this.initialUserProfile$.pipe(
    switchMap(({ territoryId }) =>
      this.campaignControllerService.getCampaignsUsingGET({ territoryId })
    ),
    shareReplay(1)
  );
  private playerCampaignUnSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  private playerCampaignSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  public playerCampaignsRefresher$ = new ReplaySubject<void>(1);
  private campaignsCouldBeChanged$ = merge(
    this.initialUserProfile$,
    this.playerCampaignSubscribed$,
    this.playerCampaignUnSubscribed$,
    this.playerCampaignsRefresher$
  ).pipe(startWith(null));

  private myCampaignsStorage =
    this.localStorageService.getStorageOf<PlayerCampaign[]>('myCampaigns');
  public myCampaigns$: Observable<PlayerCampaign[]> =
    this.campaignsCouldBeChanged$.pipe(
      switchMap(() =>
        this.campaignControllerService.getMyCampaignsUsingGET().pipe(
          ifOfflineUseStored(this.myCampaignsStorage),
          catchError((err) => {
            // FIXME: this is not recoverable, app is bricked...
            // for example new campaign subscription could be added successfully, but
            // server could not return the list of my campaigns
            this.errorService.showNotRecoverableAlert(err);
            console.error(err);
            return EMPTY;
          })
        )
      ),
      distinctUntilChanged(isEqual),
      tap((myCampaigns) => this.myCampaignsStorage.set(myCampaigns)),
      shareReplay(1)
    );

  mapFunctionalities = {
    personal: {
      challenge: {
        present: false,
      },
      prizes: {
        present: false,
      },
      leaderboard: {
        present: true,
      },
    },
    school: {
      challenge: {
        present: false,
      },
      prizes: {
        present: true,
      },
      leaderboard: {
        present: true,
        api: 'https://hscdev.playngo.it/playandgo-hsc/publicapi',
      },
    },
    company: {
      challenge: {
        present: false,
      },
      prizes: {
        present: true,
      },
      leaderboard: {
        present: false,
      },
    },
    city: {
      challenge: {
        present: true,
      },
      prizes: {
        present: true,
      },
      leaderboard: {
        present: true,
      },
    },
  };

  constructor(
    private userService: UserService,
    private campaignControllerService: CampaignControllerService,
    private localStorageService: LocalStorageService,
    private http: HttpClient,
    private errorService: ErrorService
  ) {}
  subscribeToCampaign(
    id: string,
    body?: any
  ): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService
      .subscribeCampaignUsingPOST({ campaignId: id, body })
      .pipe(
        map((res) => {
          this.playerCampaignSubscribed$.next(null);
          return res;
        })
      );
  }
  unsubscribeCampaign(id: string): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService.unsubscribeCampaignUsingPUT(id).pipe(
      map((res) => {
        this.playerCampaignUnSubscribed$.next(null);
        return res;
      })
    );
  }
  getCampaignDetailsById(id: string): Observable<Campaign> {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }

  getCompaniesForSubscription(
    campaignId: string
  ): Observable<CampaignSubscription> {
    return this.http.request<CampaignSubscription>(
      'get',
      environment.serverUrl.pgaziendeUrl +
        `/campaigns/${encodeURIComponent(String(campaignId))}/companies`,
      {}
    );
  }

  /** returns ionic "color". For example "danger" */
  getCampaignColor(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    return campaign.type;
  }
  /** returns app icon name. For example "leaf" */
  getCampaignTypeIcon(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'flower';
    }
    if (campaign.type === 'company') {
      return 'co2';
    }
    if (campaign.type === 'school') {
      return 'shield';
    }
    if (campaign.type === 'personal') {
      return 'co2';
    }
  }

  /** returns app-icon name. For example "flower" */
  getCampaignScoreIcon(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'flower';
    }
    if (campaign.type === 'company') {
      return null;
    }
    if (campaign.type === 'school') {
      return 'shield';
    }
    if (campaign.type === 'personal') {
      return null;
    }
  }
  getFunctionalityByType(what: any, type: string) {
    if (!what || !type) {
      return false;
    }
    return this.mapFunctionalities[type]?.[what];
  }
}

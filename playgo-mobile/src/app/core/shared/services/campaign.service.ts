import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import {
  combineLatest,
  EMPTY,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  tap,
  shareReplay,
  startWith,
  switchMap,
  find,
  catchError,
  withLatestFrom,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CampaignControllerService } from '../../api/generated/controllers/campaignController.service';
import { Campaign } from '../../api/generated/model/campaign';
import { CampaignSubscription } from '../../api/generated/model/campaignSubscription';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { LocalStorageService } from './local-storage.service';
import { User, UserService } from './user.service';
import { ErrorService } from './error.service';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { CampaignInfo } from '../../api/generated/model/campaignInfo';
import { RefresherService } from './refresher.service';
import { TransportType, transportTypes } from '../tracking/trip.model';
import { ifOfflineUseStored } from '../rxjs.utils';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private initialUserProfile$: Observable<User> =
    this.userService.userProfile$.pipe(
      filter((profile) => profile !== null),
      first()
    );

  public allCampaigns$: Observable<Campaign[]> = this.initialUserProfile$.pipe(
    switchMap(({ territoryId }) =>
      this.campaignControllerService.getCampaignsUsingGET({
        territoryId,
        onlyVisible: true,
      })
    ),
    shareReplay(1)
  );

  private playerCampaignUnSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  private playerCampaignSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  private campaignsCouldBeChanged$ = merge(
    this.initialUserProfile$,
    this.playerCampaignSubscribed$,
    this.playerCampaignUnSubscribed$,
    this.refresherService.refreshed$
  ).pipe(startWith(null));

  private myCampaignsStorage =
    this.localStorageService.getStorageOf<PlayerCampaign[]>('myCampaigns');
  public myCampaigns$: Observable<PlayerCampaign[]> =
    this.campaignsCouldBeChanged$.pipe(
      switchMap(() =>
        this.campaignControllerService
          .getMyCampaignsUsingGET({ onlyVisible: true })
          .pipe(
            ifOfflineUseStored(this.myCampaignsStorage),
            // this is not recoverable, app is bricked...
            // for example new campaign subscription could be added successfully, but
            // server could not return the list of my campaigns, data integrity is broken,
            // but problem when new user, in that case error is 500
            catchError((error) => {
              const isErrorExpected = true; // TODO:
              this.errorService.handleError(
                error,
                isErrorExpected ? 'silent' : 'blocking'
              );
              return of([]);
            })
          )
      ),
      distinctUntilChanged(isEqual),
      tap((myCampaigns) => this.myCampaignsStorage.set(myCampaigns)),
      shareReplay(1)
    );

  availableMeans$: Observable<TransportType[]> = combineLatest([
    this.userService.userProfileTerritory$,
    this.myCampaigns$,
  ]).pipe(
    map(([userTerritory, myCampaigns]) =>
      transportTypes
        .filter((eachTransportType) =>
          userTerritory?.territoryData?.means?.includes(eachTransportType)
        )
        .filter((eachTransportType) =>
          myCampaigns.some((campaign) =>
            campaign.campaign.validationData.means.includes(eachTransportType)
          )
        )
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1)
  );

  mapFunctionalities: Record<string, Record<string, CampaignFunctionality>> = {
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
      blacklist: {
        present: false,
      },
      stats: {
        present: true,
      },
      statsTeam: {
        present: false,
      },
      badges: {
        present: false,
      },
      dates: {
        present: false,
      },
      companies: {
        present: false,
      },
      sponsor: {
        present: false,
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
        api: environment.serverUrl.hscApi,
      },
      blacklist: {
        present: false,
      },
      stats: {
        present: false,
      },
      statsTeam: {
        present: true,
      },
      badges: {
        present: false,
      },
      dates: {
        present: true,
      },
      companies: {
        present: false,
      },
      sponsor: {
        present: false,
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
      blacklist: {
        present: false,
      },
      stats: {
        present: true,
      },
      statsTeam: {
        present: false,
      },
      badges: {
        present: false,
      },
      dates: {
        present: true,
      },
      companies: {
        present: true,
      },
      sponsor: {
        present: true,
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
      blacklist: {
        present: true,
      },
      stats: {
        present: true,
      },
      statsTeam: {
        present: false,
      },
      badges: {
        present: true,
      },
      dates: {
        present: true,
      },
      companies: {
        present: false,
      },
      sponsor: {
        present: false,
      },
    },
  };
  public subscribeCampaignAction$ = new Subject<string>();
  public unsubscribeCampaignAction$ = new Subject<string>();
  constructor(
    private userService: UserService,
    private campaignControllerService: CampaignControllerService,
    private localStorageService: LocalStorageService,
    private http: HttpClient,
    private errorService: ErrorService,
    private refresherService: RefresherService
  ) { }
  subscribeToCampaign(
    id: string,
    body?: any
  ): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService
      .subscribeCampaignUsingPOST({ campaignId: id, body })
      .pipe(
        map((res) => {
          this.subscribeCampaignAction$.next(id);
          this.playerCampaignSubscribed$.next(null);
          return res;
        })
      );
  }
  unsubscribeCampaign(id: string): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService.unsubscribeCampaignUsingPUT(id).pipe(
      map((res) => {
        this.unsubscribeCampaignAction$.next(id);
        this.playerCampaignUnSubscribed$.next(null);
        return res;
      })
    );
  }
  getCampaignDetailsById(id: string): Observable<Campaign> {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }
  getCampaignByPlayerId(id: string): Observable<CampaignInfo[]> {
    return this.campaignControllerService.getCampaignsByPlayerUsingGET(id);
  }
  getCompaniesForSubscription(
    campaignId: string
  ): Observable<CampaignSubscription> {
    return this.http.request<CampaignSubscription>(
      'get',
      environment.serverUrl.pgaziendePublicUrl +
      `/campaigns/${encodeURIComponent(String(campaignId))}/companies`,
      {}
    );
  }
  async getCompanyOfTheUser(campaign: PlayerCampaign): Promise<any> {
    return await this.http.request<any>(
      'get',
      environment.serverUrl.pgaziendeUrl +
      `/profile/campaign/${encodeURIComponent(String(campaign.campaign?.campaignId))}`,
      {}
    ).toPromise();
  }
  getPersonalCampaign(): Observable<PlayerCampaign> {
    return this.myCampaigns$.pipe(
      map((campaigns) =>
        campaigns.find((campaign) => campaign?.campaign?.type === 'personal')
      ),
      shareReplay(1)
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
      return 'ecoLeavesCity';
    }
    if (campaign.type === 'company') {
      return 'ecoLeavesCompany';
    }
    if (campaign.type === 'school') {
      return 'ecoLeavesHsc';
    }
    if (campaign.type === 'personal') {
      return 'co2';
    }
  }
  hasGame(campaign: Campaign): boolean {
    if (!campaign) {
      return false;
    }
    if (campaign.type === 'city') {
      return true;
    }
    if (campaign.type === 'company') {
      return false;
    }
    if (campaign.type === 'school') {
      return true;
    }
    if (campaign.type === 'personal') {
      return false;
    }
  }

  /** returns app-icon name. For example "flower" */
  getCampaignScoreIcon(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'ecoLeavesCity';
    }
    if (campaign.type === 'school') {
      return 'ecoLeavesHsc';
    }
    return null;
  }

  getCampaignScoreLabel(campaign: Campaign): TranslateKey {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'campaigns.score_label.flower';
    }
    if (campaign.type === 'school') {
      return 'campaigns.score_label.shield';
    }
    return null;
  }
  getFunctionalityByType(
    what: string,
    type: string
  ): CampaignFunctionality | null {
    if (!what || !type) {
      return null;
    }
    return this.mapFunctionalities[type]?.[what];
  }
}
export type CampaignFunctionality = {
  present: boolean;
  api?: string;
};

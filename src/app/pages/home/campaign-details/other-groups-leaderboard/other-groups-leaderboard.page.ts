import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, SelectCustomEvent } from '@ionic/angular';
import { find } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { DateTime } from 'luxon';

import { throwIfNil } from 'src/app/core/shared/rxjs.utils';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';

@Component({
  selector: 'app-other-groups-leaderboard',
  templateUrl: './other-groups-leaderboard.page.html',
  styleUrls: ['./other-groups-leaderboard.page.scss'],
  standalone: false,
})
export class OtherGroupsLeaderboardPage implements OnInit, OnDestroy {
  @ViewChildren('periodSelect') public selects: QueryList<IonSelect>;
  @ViewChildren('groupSelect') public groupSelects: QueryList<IonSelect>;

  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  campaign$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.allCampaigns$.pipe(
        map((campaigns) => find(campaigns, { campaignId })),
        throwIfNil(() => new Error('Campaign not found')),
        this.errorService.getErrorHandler()
      )
    ),
    shareReplay(1)
  );

  // BehaviorSubject per gruppo selezionato (inizia con null)
  private selectedGroupSubject = new BehaviorSubject<string | null>(null);
  
  // Lista gruppi disponibili (escluso il mio)
  availableGroups$: Observable<Array<{value: string, label: any}>> = 
    combineLatest([
      this.campaign$,
      this.campaignService.myCampaigns$
    ]).pipe(
      map(([campaign, myCampaigns]) => {
        const playerCampaign = myCampaigns.find(
          pc => pc.campaign.campaignId === campaign.campaignId
        );
        
        const myGroupId = playerCampaign?.subscription?.campaignData?.groupId;
        const groupList = campaign?.specificData?.groupList || [];
        
        // Escludi il mio gruppo
        return groupList.filter(g => g.value !== myGroupId);
      }),
      tap(groups => {
        // Imposta il primo gruppo come default quando la lista è pronta
        if (groups.length > 0 && this.selectedGroupSubject.value === null) {
          this.selectedGroupSubject.next(groups[0].value);
        }
      }),
      shareReplay(1)
    );

  selectedGroupChangedSubject = new Subject<SelectCustomEvent<string>>();
  
  // Observable che combina BehaviorSubject + eventi ionChange
  selectedGroup$: Observable<string> = combineLatest([
    this.selectedGroupSubject,
    this.selectedGroupChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(null)
    )
  ]).pipe(
    map(([initial, changed]) => changed || initial), // Usa changed se disponibile, altrimenti initial
    filter(groupId => !!groupId), // Emetti solo quando c'è un valore
    distinctUntilChanged(),
    tap(groupId => {
      // Aggiorna il BehaviorSubject quando cambia manualmente
      if (groupId !== this.selectedGroupSubject.value) {
        this.selectedGroupSubject.next(groupId);
      }
    }),
    shareReplay(1)
  );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(this.periods.find(p => p.configurationKey === 'periodGeneral')), // Default: globale
    shareReplay(1)
  );

  filterOptions$ = combineLatest({
    period: this.selectedPeriod$,
    campaignId: this.campaignId$,
    groupId: this.selectedGroup$,
  });

  scrollRequestSubject = new Subject<PageableRequest>();

  // Classifica del gruppo selezionato (top positions)
  leaderboardScrollResponse$: Observable<PageCampaignPlacing> =
    this.filterOptions$.pipe(
      filter(opts => !!opts.groupId), // Aspetta che sia selezionato un gruppo
      tap(opts => console.log('Filter options:', opts)), // DEBUG
      switchMap(({ period, campaignId, groupId }) =>
        this.scrollRequestSubject.pipe(
          startWith({
            page: 0,
            size: 10,
          }),
          scan((acc, curr) => {
            if (curr.page === 0) return curr;
            if (curr.page === (acc.page || 0) + 1) return curr;
            return acc;
          }, { page: -1, size: 10 } as PageableRequest),
          distinctUntilChanged((a, b) => a.page === b.page && a.size === b.size),
       
          tap(req => console.log('API Request:', { campaignId, groupId, period, ...req })), // DEBUG
          switchMap(({ page, size }) =>
            this.reportControllerService
              .getCampaingPlacingByGameUsingGET({
                page,
                size,
                campaignId,
                dateFrom: period.from,
                dateTo: period.to,
                groupId: groupId,
                filterByGroupId: true,
              })
              .pipe(
                tap(response => console.log('API Response:', response)), // DEBUG
                this.errorService.getErrorHandler()
              )
          )
        )
      )    );

  resetItems$ = this.filterOptions$.pipe(map(() => Symbol()));

  campaignContainer: PlayerCampaign;
  id: string;
  subCampaign: Subscription;
  subId: Subscription;
  subAvailableGroups: Subscription;

  constructor(
    private route: ActivatedRoute,
    private reportControllerService: ReportControllerService,
    private userService: UserService,
    private campaignService: CampaignService,
    private errorService: ErrorService,
    private pageSettingsService: PageSettingsService
  ) {
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
        }
      );
    });
  }

  ngOnInit() {
    this.changePageSettings();
    
    // Subscribe per inizializzare il primo gruppo
    this.subAvailableGroups = this.availableGroups$.subscribe();
  }

  ngOnDestroy(): void {
    this.subCampaign?.unsubscribe();
    this.subId?.unsubscribe();
    this.subAvailableGroups?.unsubscribe();
    this.selectedGroupSubject?.complete();
  }

  ionViewWillEnter() {
    this.changePageSettings();
  }

  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
      subtitle: undefined,
    });
  }

  getGroupLabel(group: {value: string, label: any}): string {
    if (!group?.label) return group.value;
    const language = this.userService.getLanguage();
    return group.label[language] || group.label.en || group.value;
  }

  getPeriods(referenceDate: DateTime): Period[] {
    return [
      {
        labelKey: 'campaigns.leaderboard.period.today',
        from: this.toServerDate(referenceDate.startOf('day')),
        to: this.toServerDate(referenceDate),
        configurationKey: 'periodToday',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_week',
        from: this.toServerDate(referenceDate.startOf('week')),
        to: this.toServerDate(referenceDate),
        configurationKey: 'periodCurrentWeek',
        default: true,
      },
      {
        labelKey: 'campaigns.leaderboard.period.last_week',
        from: this.toServerDate(
          referenceDate.startOf('week').minus({ weeks: 1 })
        ),
        to: this.toServerDate(
          referenceDate.startOf('week').minus({ weeks: 1 }).endOf('week')
        ),
        configurationKey: 'periodLastWeek',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_month',
        from: this.toServerDate(referenceDate.startOf('month')),
        to: this.toServerDate(referenceDate),
        configurationKey: 'periodCurrentMonth',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.all_time',
        from: null,
        to: null,
        configurationKey: 'periodGeneral',
        default: false,
      },
    ];
  }

  toServerDate(dateTime: DateTime): string {
    return toServerDateOnly(dateTime);
  }
}

type Period = {
  labelKey: TranslateKey;
  from: string;
  to: string;
  configurationKey: string;
  default?: boolean;
};
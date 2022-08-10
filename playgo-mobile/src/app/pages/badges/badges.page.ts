import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { BadgeCollectionConcept } from 'src/app/core/api/generated/model/badgeCollectionConcept';
import { ReportService } from 'src/app/core/shared/services/report.service';

@Component({
  selector: 'app-badges-page',
  templateUrl: './badges.page.html',
  styleUrls: ['./badges.page.scss'],
})
export class BadgesPage implements OnInit {
  badges: Array<BadgeCollectionConcept> = [];
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.campaignId$.subscribe((campaignId) => {
      this.reportService
        .getGameStatus(campaignId)
        .subscribe((status) => (this.badges = status.badges));
    });
  }
}

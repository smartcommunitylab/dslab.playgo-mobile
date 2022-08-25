import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';

@Component({
  selector: 'app-blacklist-page',
  templateUrl: './blacklist.page.html',
  styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit {
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  public blacklist$: Observable<Array<{ [key: string]: string }>>;
  constructor(
    private challengeService: ChallengeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.campaignId$.subscribe((campaignId) => {
      this.blacklist$ =
        this.challengeService.getBlacklistByCampaign(campaignId);
    });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChallengeStatsInfo } from 'src/app/core/api/generated/model/challengeStatsInfo';
import {
  getImgChallenge,
  getTypeStringChallenge,
} from 'src/app/core/shared/campaigns/campaign.utils';

@Component({
  selector: 'app-challenge-single-stat',
  templateUrl: './challenge-single-stat.component.html',
  styleUrls: ['./challenge-single-stat.component.scss'],
})
export class ChalengeSingleStatComponent implements OnInit {
  @Input() stat: ChallengeStatsInfo;
  @Input() kind: string;
  imgChallenge = getImgChallenge;
  typeChallenge: string;
  constructor(private translateService: TranslateService) { }

  ngOnInit() {
    this.typeChallenge = (this.kind === "school" && this.stat.type === 'single') ? this.translateService.instant('challenges.challenge_model.name.default-team') : this.translateService.instant(
      getTypeStringChallenge(this.stat.type));
  }
}

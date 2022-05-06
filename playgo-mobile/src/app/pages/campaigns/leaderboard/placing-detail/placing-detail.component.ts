import { Component, Input, OnInit } from '@angular/core';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { TranslateKey } from 'src/app/core/shared/type.utils';

@Component({
  selector: 'app-placing-detail',
  templateUrl: './placing-detail.component.html',
  styleUrls: ['./placing-detail.component.scss'],
})
export class PlacingDetailComponent implements OnInit {
  @Input()
  placing: CampaignPlacing;
  @Input()
  unitLabel: TranslateKey;
  @Input()
  currentPlayerId: string;

  constructor() {}

  ngOnInit() {}
}

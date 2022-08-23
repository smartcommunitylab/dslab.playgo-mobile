import { Component, Input, OnInit } from '@angular/core';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { Challengeable, ChallengePreview } from '../create-challenge.page';

@Component({
  selector: 'app-challenge-preview',
  templateUrl: './challenge-preview.component.html',
  styleUrls: ['./challenge-preview.component.scss'],
})
export class ChallengePreviewComponent implements OnInit {
  @Input() challengeModelName: Invitation.ChallengeModelNameEnum;
  @Input() pointConcept: string;
  @Input() challengeable: Challengeable;
  @Input() preview: ChallengePreview;
  constructor() {}

  ngOnInit() {}
}

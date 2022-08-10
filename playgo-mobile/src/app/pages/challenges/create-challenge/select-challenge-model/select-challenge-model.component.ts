import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { ChallengeModelOptions } from '../create-challenge.page';

@Component({
  selector: 'app-select-challenge-model',
  templateUrl: './select-challenge-model.component.html',
  styleUrls: ['./select-challenge-model.component.scss'],
})
export class SelectChallengeModelComponent implements OnInit {
  @Input() availableModels: ChallengeModelOptions[];
  @Output() selectedModel =
    new EventEmitter<Invitation.ChallengeModelNameEnum>();
  constructor() {}

  ngOnInit() {}
}

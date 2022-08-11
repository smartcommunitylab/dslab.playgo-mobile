import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateKey } from 'src/app/core/shared/type.utils';

@Component({
  selector: 'app-select-challenge-mean',
  templateUrl: './select-challenge-mean.component.html',
  styleUrls: ['./select-challenge-mean.component.scss'],
})
export class SelectChallengeMeanComponent implements OnInit {
  @Input() availableMeans: MeanOrGameInfo[];

  @Output() selectedMean = new EventEmitter<string>();

  selectedMeanName: string;

  constructor() {}

  ngOnInit() {}

  selectMean(model: MeanOrGameInfo) {
    this.selectedMeanName = model.name;
    this.selectedMean.emit(this.selectedMeanName);
  }
}

export type MeanOrGameInfo = {
  isMean: boolean;
  name: string;
  icon: string;
  title: TranslateKey;
};

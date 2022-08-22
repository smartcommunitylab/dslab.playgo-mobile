import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Challengeable } from '../create-challenge.page';

@Component({
  selector: 'app-select-challengeable',
  templateUrl: './select-challengeable.component.html',
  styleUrls: ['./select-challengeable.component.scss'],
})
export class SelectChallengeableComponent {
  @Input() availableChallengeables: Challengeable[];

  @Output() selectedChallengeable = new EventEmitter<string>();

  selectedChallengeableId: string;

  constructor() {}

  selectChallengeable(challengeable: Challengeable) {
    this.selectedChallengeableId = challengeable.id;
    this.selectedChallengeable.emit(this.selectedChallengeableId);
  }
}

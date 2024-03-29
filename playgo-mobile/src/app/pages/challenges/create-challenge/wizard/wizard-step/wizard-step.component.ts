import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';

@Component({
  selector: 'app-wizard-step',
  templateUrl: './wizard-step.component.html',
  styleUrls: ['./wizard-step.component.scss'],
})
export class WizardStepComponent {
  @Input()
  title: TranslateKey;
  @Input()
  validForNextStep = true;

  @Output()
  activated = new EventEmitter<void>();

  @ViewChild('template', { read: TemplateRef, static: true })
  template: TemplateRef<any>;
}

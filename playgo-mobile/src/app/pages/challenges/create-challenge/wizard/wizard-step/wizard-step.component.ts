import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateKey } from 'src/app/core/shared/type.utils';

@Component({
  selector: 'app-wizard-step',
  templateUrl: './wizard-step.component.html',
  styleUrls: ['./wizard-step.component.scss'],
})
export class WizardStepComponent {
  @Input()
  title: TranslateKey;
  @ViewChild('template', { read: TemplateRef, static: true })
  template: TemplateRef<any>;
}

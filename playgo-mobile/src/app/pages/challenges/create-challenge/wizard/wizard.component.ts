import {
  AfterContentInit,
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  Directive,
  Input,
  OnInit,
  Optional,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { WizardStepComponent } from './wizard-step/wizard-step.component';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit, AfterContentInit {
  @Input() title: string;
  @Input() headerColor = 'primary';

  @ContentChildren(WizardStepComponent, {})
  set stepComponents(stepComponents: QueryList<WizardStepComponent>) {
    this.steps = stepComponents.toArray();
    this.templates = stepComponents.map(
      (eachComponent) => eachComponent.template
    );
    console.log('templates', this.templates);
  }
  public steps: WizardStepComponent[] = [];
  public templates: TemplateRef<WizardStepComponent>[] = [];

  public selectedStep = 0;

  constructor() {}

  ngAfterContentInit(): void {}

  changeStep(newStep: number) {
    this.selectedStep = newStep;
  }

  ngOnInit() {}
}

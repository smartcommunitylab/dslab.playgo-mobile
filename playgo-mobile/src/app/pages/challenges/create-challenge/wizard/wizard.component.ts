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

  @ContentChildren(WizardStepComponent, {})
  set stepComponents(stepComponents: QueryList<WizardStepComponent>) {
    this.steps = stepComponents.toArray();
    this.templates = stepComponents.map(
      (eachComponent) => eachComponent.template
    );
    this.changeStep(0);
  }
  public steps: WizardStepComponent[] = [];
  public templates: TemplateRef<WizardStepComponent>[] = [];

  public selectedStepIndex = 0;
  public selectedStep: WizardStepComponent;

  constructor() {}

  ngAfterContentInit(): void {}

  changeStep(newStep: number) {
    this.selectedStepIndex = newStep;
    this.selectedStep = this.steps[this.selectedStepIndex];
    this.selectedStep.activated.next();
  }

  ngOnInit() {}
}

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
    this.selectedStep = this.steps[0];
    this.templates = stepComponents.map(
      (eachComponent) => eachComponent.template
    );
    console.log('templates', this.templates);
  }
  public steps: WizardStepComponent[] = [];
  public templates: TemplateRef<WizardStepComponent>[] = [];

  public selectedStepIndex = 0;
  public selectedStep: WizardStepComponent;

  constructor() {}

  ngAfterContentInit(): void {}

  changeStep(newStep: number) {
    this.selectedStepIndex = newStep;
  }

  ngOnInit() {}
}

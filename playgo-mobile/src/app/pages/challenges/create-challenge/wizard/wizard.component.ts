import {
  AfterContentInit,
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
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
  @Input() title = '';
  @Input() backButton = true;
  @Input() finishButtonLabel = '';
  @Output() finish = new EventEmitter<void>();

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

  private isStepValid(newStepIdx: number): boolean {
    if (newStepIdx === 0) {
      return true;
    }
    const previousStepIdx = Math.max(newStepIdx - 1, 0);
    const previousStep = this.steps[previousStepIdx];
    return previousStep.validForNextStep !== false;
  }

  changeStep(newStepIdx: number) {
    if (!this.isStepValid(newStepIdx)) {
      return;
    }

    this.selectedStepIndex = newStepIdx;
    this.selectedStep = this.steps[this.selectedStepIndex];
    this.selectedStep.activated.next();
  }

  ngOnInit() {}
}

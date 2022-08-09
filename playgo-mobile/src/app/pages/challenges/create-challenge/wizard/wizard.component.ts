import {
  AfterContentInit,
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  Directive,
  OnInit,
  Optional,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-wizard-step',
  template: `
    <ng-template #template>
      <ng-content></ng-content>
    </ng-template>
  `,
  styles: [''],
})
export class WizardStepComponent {
  @ViewChild('template', { read: TemplateRef, static: true })
  template: TemplateRef<any>;
}

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit, AfterContentInit {
  @ContentChildren(WizardStepComponent, {})
  set stepComponents(stepComponents: QueryList<WizardStepComponent>) {
    this.templates = stepComponents.map(
      (eachComponent) => eachComponent.template
    );
    console.log('templates', this.templates);
  }
  public templates: TemplateRef<WizardStepComponent>[];

  public selectedStep = 0;

  constructor() {}

  ngAfterContentInit(): void {}

  changeStep(newStep: number) {
    this.selectedStep = newStep;
  }

  ngOnInit() {}
}

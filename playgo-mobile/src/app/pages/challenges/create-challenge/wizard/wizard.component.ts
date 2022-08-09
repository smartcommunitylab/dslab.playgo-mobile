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
} from '@angular/core';

@Directive({
  selector: '[appWizardPage]',
})
export class WizardPageDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
    console.log('directive created!');
  }
}

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit, AfterContentInit {
  @ContentChildren(WizardPageDirective, {})
  set directives(directives: QueryList<WizardPageDirective>) {
    this.templates = directives.map(
      (eachDirective) => eachDirective.templateRef
    );
  }
  public templates: TemplateRef<WizardPageDirective>[];

  constructor() {}

  ngAfterContentInit(): void {}

  ngOnInit() {}
}

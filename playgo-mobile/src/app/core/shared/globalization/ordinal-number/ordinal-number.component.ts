import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-ordinal-number',
  template: `
    <ng-container *ngIf="value !== undefined">
      {{
        'number.ordinal.' + ordinalPluralRules.select(value)
          | translate: { ordinal: value }
      }}
    </ng-container>
  `,
  styleUrls: [],
})
export class OrdinalNumberComponent implements OnInit {
  @Input()
  value: number;

  ordinalPluralRules = new Intl.PluralRules(this.userService.getLocale(), {
    type: 'ordinal',
  });

  constructor(private userService: UserService) {}

  ngOnInit() {}
}

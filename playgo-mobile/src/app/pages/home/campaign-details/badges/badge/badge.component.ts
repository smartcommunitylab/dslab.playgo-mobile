import { Component, Input, OnInit } from '@angular/core';
import { BadgeConcept } from 'src/app/core/api/generated/model/badgeConcept';
import { BadgeService } from 'src/app/core/shared/services/badge.service';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent implements OnInit {
  @Input() badge: BadgeConcept;
  imagePath: string;

  constructor(private badgeService: BadgeService) {}

  async ngOnInit() {
    const badgeData = await this.badgeService.getBadgeByKey(this.badge.name);
    this.imagePath = 'data:image/jpg;base64,' + badgeData.imageByte;
  }
}

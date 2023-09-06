import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BadgeConcept } from 'src/app/core/api/generated/model/badgeConcept';
import { BadgeService } from 'src/app/core/shared/services/badge.service';

@Component({
  selector: 'app-company-item',
  templateUrl: './company-item.component.html',
  styleUrls: ['./company-item.component.scss'],
})
export class CompanyItemComponent implements OnInit {
  @Input() company: any;
  imagePath: string;
  campaignId: string;
  constructor(private navCtrl: NavController, private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');

    this.imagePath = this.company.logo;

  }
  navigateCompany() {
    this.navCtrl.navigateForward('/pages/tabs/home/details/' + this.campaignId + '/companies/' + this.company.id, { state: this.company });
  }
}

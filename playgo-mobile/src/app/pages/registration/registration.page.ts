import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'src/app/core/territory/territory.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  territoryList = [];
  constructor(private territoryService: TerritoryService) {
    this.territoryService.territories$.subscribe((territories) => {
      this.territoryList = territories;
    });
  }

  ngOnInit() {
  }

}

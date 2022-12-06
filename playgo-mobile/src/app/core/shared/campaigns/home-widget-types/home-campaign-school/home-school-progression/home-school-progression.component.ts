import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from 'src/app/core/shared/services/team.service';


@Component({
  selector: 'app-home-school-progression',
  templateUrl: './home-school-progression.component.html',
  styleUrls: ['./home-school-progression.component.scss'],
})
export class HomeSchoolProgressionComponent implements OnInit, OnDestroy {
  @Input() stat: any;
  @Input() type: any;

  constructor(
    private teamService: TeamService

  ) { }

  ngOnInit() {

  }
  goToChallenge(event: Event) {

  }

  ngOnDestroy() {
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateTo(relativePage: string) {
    this.router.navigate([relativePage], { relativeTo: this.route });
  }
  ngOnInit() {
    //todo call profile service
  }
}

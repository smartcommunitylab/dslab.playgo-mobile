import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  templateUrl: './end-session.page.html',
  standalone: false
})
export class EndSessionPage implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.endSessionCallback();
  }
}

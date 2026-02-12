import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-update-loading',
  templateUrl: './update-loading.component.html',
  styleUrls: ['./update-loading.component.scss'],
  standalone: false
})
export class UpdateLoadingComponent {
  @Input() message: string = 'Download aggiornamento in corso...';
}
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IUser } from 'src/app/core/shared/model/user.model';

@Component({
  selector: 'app-change-profile-modal',
  templateUrl: './change-profile-modal.page.html',
  styleUrls: ['./change-profile-modal.page.css'],
})
export class ChangeProfileModalPage implements OnInit {
  @Input() profile: IUser;

  constructor(private modalCtr: ModalController) { }

  ngOnInit() { }

  async close() {
    await this.modalCtr.dismiss();
  }
  async closeAndSave() {
    await this.modalCtr.dismiss(this.profile);
  }
}

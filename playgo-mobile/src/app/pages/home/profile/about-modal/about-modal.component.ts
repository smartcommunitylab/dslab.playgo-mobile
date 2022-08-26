import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import * as internalGitInfo from 'src/assets/git-version.json';
import { environment } from 'src/environments/environment';
const gitInfo = internalGitInfo as unknown as {
  raw: string;
  hash: string;
};

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.scss'],
})
export class AboutModalComponent implements OnInit {
  angularBuildCommit = gitInfo.raw || gitInfo.hash || '-';
  angularBuildConfiguration = environment.production
    ? 'Production'
    : 'Development';

  constructor(
    private modalController: ModalController,
    public appStatusService: AppStatusService
  ) {}

  ngOnInit() {}
  close() {
    this.modalController.dismiss();
  }
}

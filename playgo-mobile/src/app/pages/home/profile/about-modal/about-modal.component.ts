import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import * as internalGitInfo from 'src/assets/git-version.json';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

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
  javaAppInfo = '';

  constructor(
    private modalController: ModalController,
    public appStatusService: AppStatusService
  ) {}

  async ngOnInit() {
    await Preferences.configure({ group: 'gitInfo' });
    const info = await Preferences.get({ key: 'hash' });
    this.javaAppInfo = info.value;
    console.log('Preferences', info);
  }
  close() {
    this.modalController.dismiss();
  }
}

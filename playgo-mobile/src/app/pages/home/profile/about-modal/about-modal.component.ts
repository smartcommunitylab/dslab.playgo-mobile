import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import * as internalGitInfo from 'src/assets/git-version.json';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { ErrorService } from 'src/app/core/shared/services/error.service';

const gitInfo = internalGitInfo as unknown as GitInfo;

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.scss'],
})
export class AboutModalComponent implements OnInit {
  angularBuildCommit = gitInfo.raw || gitInfo.hash || '-';
  angularBuildConfiguration = environment.name;
  javaBuildCommit = '';
  capacitorFlavor = '';

  constructor(
    private modalController: ModalController,
    public appStatusService: AppStatusService,
    private errorService: ErrorService
  ) {}

  async ngOnInit() {
    try {
      await Preferences.configure({ group: 'buildInfo' });
      const javaInfoJson = await Preferences.get({ key: 'gitInfo' });
      const javaInfo: GitInfo = JSON.parse(javaInfoJson.value);
      this.javaBuildCommit = javaInfo?.raw || javaInfo?.hash || '-';
      this.capacitorFlavor = (
        await Preferences.get({ key: 'capacitorFlavor' })
      ).value;
    } catch (e) {
      this.errorService.handleError(e, 'silent');
    }
  }
  close() {
    this.modalController.dismiss();
  }
}

interface GitInfo {
  raw: string;
  hash: string;
}

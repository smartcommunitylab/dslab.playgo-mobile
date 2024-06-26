import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import * as internalGitInfo from 'src/assets/git-version.json';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { ErrorService } from 'src/app/core/shared/services/error.service';

const gitInfo = internalGitInfo as unknown as GitInfo;

/**
 * Page to show information about the app. Accessible after clicking 5 times
 * on the top of the profile page (app-profile-component).
 *
 * Displayed data are from different sources, mainly from the capacitor plugins.
 * One common technique (lets call it "java->ts") is to read some values that
 * are not available to the angular in the MainActivity.java and then pass them
 * to the android's SharedPreferences. This information is then accessible by
 * capacitor Preferences plugin, so we can read it. Ios variant is not yet implemented.
 *
 *
 * - App id, App version: Info about released app taken from capacitor AppPlugin
 * - Code push label:
 *      Label of the code push package currently installed taken
 *      from capacitor CodePushPlugin
 * - Capacitor Flavor:
 *      What was value of FLAVOR environment variable when ionic sync was run.
 *      See 'ionic:sync:stage' script in package.json and capacitor.config.ts.
 *      Value in capacitor.config.ts is stored in resulting config and passed
 *      using "java->ts" technique.
 * - Angular build commit:
 *     Commit hash of the commit that was used to build angular.
 *     Note that this could be different from the commit that was used to build full
 *     app (android, ios), because of the code push. This value is taken from the
 *     'src/assets/git-version.json' file, which is generated by the "before-build"
 *     npm script in package.json.
 * - Angular Build Configuration:
 *     Value of the 'environment.name' variable. Specifies which configuration
 *     was used to build angular. See all environment.*.ts files.
 * - App build commit: Commit hash of the commit that was used to build the
 *     android or ios app. This value is taken from the
 *     'android/app/src/main/assets/git-version.json', which is also generated in
 *     the "before-build" npm script in package.json. Note that it could not be\
 *     read from src folder, because code push would overwrite it. To get value
 *     from this file, we use "java->ts" technique.
 * */
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

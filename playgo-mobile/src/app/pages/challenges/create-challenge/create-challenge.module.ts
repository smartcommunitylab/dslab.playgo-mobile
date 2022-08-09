import { NgModule } from '@angular/core';

import { CreateChallengePageRoutingModule } from './create-challenge-routing.module';

import { CreateChallengePage } from './create-challenge.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { WizardComponent } from './wizard/wizard.component';
import { WizardStepComponent } from './wizard/wizard-step/wizard-step.component';

@NgModule({
  imports: [PlayGoSharedModule, CreateChallengePageRoutingModule],
  declarations: [CreateChallengePage, WizardComponent, WizardStepComponent],
})
export class CreateChallengePageModule {}

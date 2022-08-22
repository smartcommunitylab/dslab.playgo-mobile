import { NgModule } from '@angular/core';

import { CreateChallengePageRoutingModule } from './create-challenge-routing.module';

import { CreateChallengePage } from './create-challenge.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { WizardComponent } from './wizard/wizard.component';
import { WizardStepComponent } from './wizard/wizard-step/wizard-step.component';
import { SelectChallengeModelComponent } from './select-challenge-model/select-challenge-model.component';
import { SelectChallengeMeanComponent } from './select-challenge-mean/select-challenge-mean.component';
import { SelectChallengeableComponent } from './select-challengeable/select-challengeable.component';

@NgModule({
  imports: [PlayGoSharedModule, CreateChallengePageRoutingModule],
  declarations: [
    CreateChallengePage,
    WizardComponent,
    WizardStepComponent,
    SelectChallengeModelComponent,
    SelectChallengeMeanComponent,
    SelectChallengeableComponent,
  ],
})
export class CreateChallengePageModule {}

import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Invitation } from 'src/app/core/api/generated/model/invitation';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challengeable, ChallengePreview } from '../create-challenge.page';

@Component({
  selector: 'app-challenge-preview',
  templateUrl: './challenge-preview.component.html',
  styleUrls: ['./challenge-preview.component.scss'],
})
export class ChallengePreviewComponent implements OnInit {
  @Input() challengeModelName: Invitation.ChallengeModelNameEnum;
  @Input() pointConcept: string;
  @Input() challengeable: Challengeable;
  @Input() preview: ChallengePreview;

  avatarUrl$ = this.userService.userProfile$.pipe(
    map((profile) => profile.avatar.avatarSmallUrl)
  );

  constructor(private userService: UserService) {}

  ngOnInit() {}
}

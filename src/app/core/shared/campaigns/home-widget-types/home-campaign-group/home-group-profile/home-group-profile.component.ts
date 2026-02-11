import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-home-group-profile',
  templateUrl: './home-group-profile.component.html',
  styleUrls: ['./home-group-profile.component.scss'],
  standalone: false
})
export class HomeGroupProfileComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  
  groupName: string;
  groupId: string;

  constructor(
    private userService: UserService,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.groupId = this.campaignContainer?.subscription?.campaignData?.groupId;
    
    if (this.groupId) {
      const groupList = this.campaignContainer?.campaign?.specificData?.groupList;
      
      if (groupList && Array.isArray(groupList)) {
        const group = groupList.find(g => g.value === this.groupId);
        
        if (group && group.label) {
          const language = this.userService.getLanguage();
          this.groupName = group.label[language] || group.label.en || this.groupId;
        } else {
          this.groupName = this.groupId;
        }
      } else {
        this.groupName = this.groupId;
      }
    }
  }

  goToLeaderboard(event: Event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateForward(
      `/pages/tabs/home/details/${this.campaignContainer?.campaign?.campaignId}/leaderboard`
    );
  }
}
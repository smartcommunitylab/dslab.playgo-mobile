import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { PlayerTeamControllerService } from '../../api/generated-hsc/controllers/playerTeamController.service';
import { TeamStatsControllerService } from '../../api/generated-hsc/controllers/teamStatsController.service';
import { PlacingComparison } from '../../api/generated-hsc/model/placingComparison';
import { PlayerTeam } from '../../api/generated-hsc/model/playerTeam';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';

@Injectable({
    providedIn: 'root',
})
export class TeamService {
    // public myTeam$: Observable<Campaign[]> = this.initialUserProfile$.pipe(
    //     switchMap(({ territoryId }) =>
    //       this.campaignControllerService.getCampaignsUsingGET({
    //         territoryId,
    //         onlyVisible: true,
    //       })
    //     ),
    //     shareReplay(1)
    //   );
    constructor(private teamStatsControllerService: TeamStatsControllerService,
        private playerTeamController: PlayerTeamControllerService) {
    }
    getTeamPlacing(
        campaignId?: string,
        groupId?: string,
        dateFrom?: string,
        dateTo?: string
    ): Observable<CampaignPlacing> {
        return this.teamStatsControllerService.getGroupCampaingPlacingByGameUsingGET({
            campaignId,
            groupId,
            dateFrom,
            dateTo,
        });
    }
    getMyTeam(campaignId: string, groupId: string): Observable<PlayerTeam> {
        return this.playerTeamController.getMyTeamInfoUsingGET(
            {
                initiativeId: campaignId,
                teamId: groupId
            }).pipe(shareReplay(1));
    }
    getProgressionTeam(campaignId: string, groupId: string, dateFrom?: string, dateTo?: string): Observable<PlacingComparison> {
        return this.teamStatsControllerService.getCampaignPlacingByGameGroupComparisonUsingGET(
            {
                campaignId,
                groupId,
                dateFrom,
                dateTo
            }).pipe(shareReplay(1));
    }
    getProgressionPlayer(campaignId: string, playerId: string, dateFrom?: string, dateTo?: string): Observable<PlacingComparison> {
        return this.teamStatsControllerService.getCampaignPlacingByGamePlayerComparisonUsingGET(
            {
                campaignId,
                playerId,
                dateFrom,
                dateTo
            }).pipe(shareReplay(1));
    }
}

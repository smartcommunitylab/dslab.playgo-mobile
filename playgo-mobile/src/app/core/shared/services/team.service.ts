import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { PlayerTeamControllerService } from '../../api/generated-hsc/controllers/playerTeamController.service';
import { TeamStatsControllerService } from '../../api/generated-hsc/controllers/teamStatsController.service';
import { Avatar } from '../../api/generated-hsc/model/avatar';
import { PlacingComparison } from '../../api/generated-hsc/model/placingComparison';
import { PlayerTeam } from '../../api/generated-hsc/model/playerTeam';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { ErrorService } from './error.service';

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
    private avatarDefaults: Avatar = {
        avatarSmallUrl: 'assets/images/registration/people.svg',
        avatarUrl: 'assets/images/registration/people.svg',
    };
    constructor(private teamStatsControllerService: TeamStatsControllerService,
        private playerTeamController: PlayerTeamControllerService,
        private errorService: ErrorService) {
    }
    getTeamAvatar(teamId: string): Observable<Avatar> {

        return this.playerTeamController
            .getTeamAvatarUsingGET(teamId)
            .pipe(
                catchError((error) => {
                    if (
                        error instanceof HttpErrorResponse &&
                        (error?.status === 404 ||
                            error?.status === 400 ||
                            error?.status === 500) &&
                        error?.error?.ex === 'avatar not found'
                    ) {
                        return of(this.avatarDefaults);
                    }
                    // we do not want to block app completely.
                    this.errorService.handleError(error, 'normal');
                    return of(this.avatarDefaults);
                }),
                map((avatar) => ({
                    ...this.avatarDefaults,
                    ...this.timestampAvatarUrls(avatar),
                }))
            );
    }
    private timestampAvatarUrls(avatar: Avatar): Avatar {
        if (avatar) {
            return {
                ...avatar,
                avatarUrl: this.timestampUrl(avatar.avatarUrl),
                avatarSmallUrl: this.timestampUrl(avatar.avatarSmallUrl),
            };
        }
        else {
            return {
                ...this.avatarDefaults
            };
        }
    }
    private timestampUrl(url: string): string {
        if (!url || url.includes('?')) {
            return url;
        }
        return url + '?t=' + new Date().getTime();
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

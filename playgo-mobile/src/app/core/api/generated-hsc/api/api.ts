export * from './playerTeamController.service';
import { PlayerTeamControllerService } from './playerTeamController.service';
export * from './teamStatsController.service';
import { TeamStatsControllerService } from './teamStatsController.service';
export const APIS = [PlayerTeamControllerService, TeamStatsControllerService];

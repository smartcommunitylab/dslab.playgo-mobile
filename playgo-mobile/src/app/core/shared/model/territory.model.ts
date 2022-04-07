import { TransportType } from '../tracking/trip.model';

export interface ITerritory {
  territoryId: string;
  name: string;
  description: string;
  messagingAppId: string;
  territoryData: TerritoryData;
}
export interface ITerritoryData {
  means: TransportType[];
}
export class TerritoryData implements ITerritoryData {
  constructor(public means: TransportType[]) {}
}
export class Territory implements ITerritory {
  constructor(
    public territoryId: string,
    public name: string,
    public description: string,
    public messagingAppId: string,
    public territoryData: TerritoryData
  ) {}
}

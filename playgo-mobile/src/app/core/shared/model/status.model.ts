import { Territory } from '../../api/generated/model/territory';

export interface IStatus {
  playerId?: string;
  registrationDate?: string;
  activityDays?: number;
  transportStatsList?: any;
  travels?: number;
  territory?: Territory;
  co2?: number;
}
export class Status implements IStatus {
  constructor(
    public playerId?: string,
    public registrationDate?: string,
    public activityDays?: number,
    public transportStatsList?: any,
    public travels?: number,
    public territory?: Territory,
    public co2?: number
  ) { }
}

type GroupMode = 'day' | 'week' | 'month';
export interface IGeneralStatistic {
  meansStats?: IMeansStat[];
}
export interface IMeansStat {
  modeType: string;
  period: string;
  totalCo2: number;
  totalDistance: number;
  totalDuration: number;
  totalTravel: number;
}
export class GeneralStatistic implements IGeneralStatistic {
  constructor(public meansStats: IMeansStat[]) { }
}
export class MeansStats implements IMeansStat {
  constructor(
    public modeType: string,
    public period: string,
    public totalCo2: number,
    public totalDistance: number,
    public totalDuration: number,
    public totalTravel: number
  ) { }
}

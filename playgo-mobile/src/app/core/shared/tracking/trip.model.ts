export class Trip {
  tripId: string;
  constructor(data?: Trip) {
    Object.assign(this, data || {});
  }
  public static fromFirstPart(firstPart: TripPart): Trip {
    const tripId = `${firstPart.mean}_${firstPart.started}`;
    return new Trip({ tripId });
  }
}

export class TripPart {
  mean: Mean;
  multimodalId: string;
  started: number;
  constructor(data?: TripPart) {
    Object.assign(this, data || {});
  }
  public static fromMean(mean: Mean): TripPart {
    const started = new Date().getTime();
    return new TripPart({
      started,
      mean,
      multimodalId: `multimodal_${started}`,
    });
  }
}

export type Mean = 'walk' | 'bicycle' | 'bus' | 'train' | 'car';

export const TRIP_END = 'TRIP_END' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TRIP_END = typeof TRIP_END;

export const NO_TRIP_STARTED = 'NO_TRIP_STARTED' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type NO_TRIP_STARTED = typeof NO_TRIP_STARTED;

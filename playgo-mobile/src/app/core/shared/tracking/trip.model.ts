export class Trip {
  multimodalId: string;
  constructor(data?: Trip) {
    Object.assign(this, data || {});
  }
  public static fromFirstPart(firstPart: TripPart): Trip {
    return new Trip({ multimodalId: firstPart.multimodalId });
  }
}

export class TripPart {
  isInitial: boolean;
  idTrip: string;
  transportType: TransportType;
  start: number;
  multimodalId: string;
  sharedTravelId: string;
  constructor(data?: TripPart) {
    Object.assign(this, data || {});
  }
  public static fromTransportType(transportType: TransportType): TripPart {
    const start = new Date().getTime();
    const idTrip = `${transportType}_${start}`;
    return new TripPart({
      start,
      transportType,
      idTrip,
      sharedTravelId: null,
      multimodalId: null,
      isInitial: false,
    });
  }
}

export type TransportType = 'walk' | 'bike' | 'bus' | 'train' | 'car' | 'boat';

export const TRIP_END = 'TRIP_END' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TRIP_END = typeof TRIP_END;

export const NO_TRIP_STARTED = 'NO_TRIP_STARTED' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type NO_TRIP_STARTED = typeof NO_TRIP_STARTED;

export const LOW_ACCURACY = 'LOW_ACCURACY' as const;
export const POWER_SAVE_MODE = 'POWER_SAVE_MODE' as const;
// probably location services are disabled by user.
export const UNABLE_TO_GET_POSITION = 'UNABLE_TO_GET_POSITION' as const;

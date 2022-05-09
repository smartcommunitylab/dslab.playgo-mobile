import { TranslateKey } from '../type.utils';

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

export const transportTypes: TransportType[] = [
  'walk',
  'bike',
  'bus',
  'train',
  'car',
  'boat',
];

export const transportTypeColors: Record<TransportType, string> = {
  bike: 'red',
  bus: 'green',
  car: 'yellow',
  train: 'blue',
  walk: 'brown',
  boat: 'blue',
};
export const transportTypeIcons: Record<TransportType, string> = {
  bike: 'bicycle',
  bus: 'bus',
  car: 'car',
  train: 'train',
  walk: 'walk',
  boat: 'boat',
};
export const transportTypeLabels: Record<TransportType, TranslateKey> = {
  bike: 'trip_detail.mean.bike',
  bus: 'trip_detail.mean.bus',
  car: 'trip_detail.mean.car',
  train: 'trip_detail.mean.train',
  walk: 'trip_detail.mean.walk',
  boat: 'trip_detail.mean.boat',
};

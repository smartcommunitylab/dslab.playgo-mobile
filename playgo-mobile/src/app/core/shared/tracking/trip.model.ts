import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { UserError } from '../services/error.service';

/** Whole multimodal trip */
export class Trip {
  multimodalId: string;
  constructor(data?: Trip) {
    Object.assign(this, data || {});
  }
  public static fromFirstPart(firstPart: TripPart): Trip {
    return new Trip({ multimodalId: firstPart.multimodalId });
  }
}

/** Single part in (potentially) multimodal trip */
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

export type TransportType =
  | 'walk'
  | 'bike'
  | 'bus'
  | 'train'
  | 'car'
  | 'boat'
  | 'unknown';

export const TRIP_END = 'TRIP_END' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TRIP_END = typeof TRIP_END;

export const NO_TRIP_STARTED = 'NO_TRIP_STARTED' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type NO_TRIP_STARTED = typeof NO_TRIP_STARTED;

export const LOW_ACCURACY = new UserError({
  id: 'LOW_ACCURACY',
  message: 'tracking.errors.LOW_ACCURACY',
});
export const ACCESS_DENIED = new UserError({
  id: 'ACCESS_DENIED',
  message: 'tracking.errors.ACCESS_DENIED',
});
export const POWER_SAVE_MODE = new UserError({
  id: 'POWER_SAVE_MODE',
  message: 'tracking.errors.POWER_SAVE_MODE',
});

// probably location services are disabled by user.
export const UNABLE_TO_GET_POSITION = new UserError({
  id: 'UNABLE_TO_GET_POSITION',
  message: 'tracking.errors.UNABLE_TO_GET_POSITION',
});

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
  unknown: 'black',
};
export const transportTypeIcons: Record<TransportType, string> = {
  bike: 'pedal_bike',
  bus: 'directions_bus',
  car: 'custom_carpooling',
  train: 'directions_train',
  walk: 'directions_walk',
  boat: 'directions_boat',
  unknown: 'help',
};
export const transportTypeLabels: Record<TransportType, TranslateKey> = {
  bike: 'trip_detail.mean.bike',
  bus: 'trip_detail.mean.bus',
  car: 'trip_detail.mean.car',
  train: 'trip_detail.mean.train',
  walk: 'trip_detail.mean.walk',
  boat: 'trip_detail.mean.boat',
  unknown: 'trip_detail.mean.unknown',
};

export function isTransportType(
  transportType: string
): transportType is TransportType {
  return (
    transportTypes.includes(transportType as TransportType) ||
    transportType === 'unknown'
  );
}

export function getTransportTypeIcon(transportType: string): string {
  if (!isTransportType(transportType)) {
    console.error(`Unknown transport type: ${transportType}`);
    return null;
  }
  return transportTypeIcons[transportType];
}
export function getTransportTypeLabel(transportType: string): TranslateKey {
  if (!isTransportType(transportType)) {
    console.error(`Unknown transport type: ${transportType}`);
    return null;
  }
  return transportTypeLabels[transportType];
}
export function getTransportTypeColor(transportType: string): string {
  if (!isTransportType(transportType)) {
    console.error(`Unknown transport type: ${transportType}`);
    return null;
  }
  return transportTypeColors[transportType];
}

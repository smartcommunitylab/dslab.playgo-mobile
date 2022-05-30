/**
 * All time based operation should be done with this utils.
 * If needed, we can create a service for it. (For example if timezone is not fixed)
 */

import { isNil } from 'lodash-es';
import { DateTime, Zone } from 'luxon';

/**
 * Some information about time should be interpreted as "territory" or
 * "central" time, and not using client timezone. For example dates.
 *
 * For that occasions we need to use this timezone.
 */
export function getServerTimeZone(): string {
  return 'Europe/Rome';
}

/**
 * Used for sending time instant to server. It is always UTC.
 *
 * Even if this function is quite trivial, using this function enables us to
 * change how time is sent to server for whole app.
 *
 * @param dateTime
 * @returns UTC dateTime milliseconds.
 */
export function toServerDateTime(dateTime: DateTime): number {
  if (isNil(dateTime)) {
    return null;
  }
  if (!dateTime.isValid) {
    console.error(
      'Invalid dateTime',
      dateTime,
      dateTime.invalidReason,
      dateTime.invalidExplanation
    );
    throw new Error('Invalid dateTime');
  }

  return dateTime.toMillis();
}

/**
 *
 * Converts DateTime to string, but only date part.
 * It uses server timezone! (see getServerTimeZone)
 * Should be used as little as possible. Mainly for sending time information that are
 * not instances in time, but more information about "human" constructions.
 *
 * @param dateTime
 * @returns yyyy-MM-dd string in server timezone.
 */
export function toServerDateOnly(dateTime: DateTime): string {
  if (isNil(dateTime)) {
    return '';
  }
  if (!dateTime.isValid) {
    console.error(
      'Invalid dateTime',
      dateTime,
      dateTime.invalidReason,
      dateTime.invalidExplanation
    );
    throw new Error('Invalid dateTime');
  }

  return dateTime.setZone(getServerTimeZone()).toFormat('yyyy-MM-dd');
}

/**
 * Converts server milliseconds to DateTime. Keeps null as null.
 * Only problem is that generated models has Date fields, but in runtime, they are
 * numbers.
 */
export function fromServerDate(dateTime: Date | number) {
  if (!dateTime) {
    return null;
  }
  return DateTime.fromJSDate(new Date(dateTime));
}

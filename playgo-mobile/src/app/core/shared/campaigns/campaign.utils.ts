import { DateTime, DateTimeUnit } from 'luxon';

export function getImgChallenge(challengeType: string) {
  if (
    [
      'groupCooperative',
      'groupCompetitiveTime',
      'groupCompetitivePerformance',
    ].indexOf(challengeType) > -1
  ) {
    return challengeType;
  }
  if ('survey' === challengeType) { return 'listCircle'; }
  return 'default';
}
export function getTypeStringChallenge(challengeType: string) {
  if (
    [
      'groupCooperative',
      'groupCompetitiveTime',
      'groupCompetitivePerformance',
      'survey',
    ].indexOf(challengeType) > -1
  ) {
    return 'challenges.challenge_model.name.' + challengeType;
  }
  return 'challenges.challenge_model.name.default';
}

export function getPeriods(referenceDate: DateTime): Period[] {
  return [
    {
      labelKey: 'campaigns.stats.filter.period.week',
      label: 'dd - MMM',
      group: 'day',
      format: 'dd-MM',
      chartFormat: 'EEE',
      add: 'week',
      switchTo: null,
      from: referenceDate.startOf('week'),
      to: referenceDate.endOf('week'),
    },
    {
      labelKey: 'campaigns.stats.filter.period.month',
      label: 'MMMM',
      group: 'week',
      format: 'dd-MM-yyyy',
      chartFormat: 'dd',
      add: 'month',
      switchTo: 'day',
      from: referenceDate.startOf('month'),
      to: referenceDate.endOf('month'),
    },
    {
      labelKey: 'campaigns.stats.filter.period.year',
      label: 'yyyy',
      group: 'month',
      format: 'MM-yyyy',
      chartFormat: 'MMM',
      add: 'year',
      switchTo: 'week',
      from: referenceDate.startOf('year'),
      to: referenceDate.endOf('year'),
    },
  ];
}

export type Period = {
  labelKey: string;
  label: string;
  add: DateTimeUnit;
  format: string;
  chartFormat: string;
  switchTo: string;
  group: DateTimeUnit;
  from: DateTime;
  to: DateTime;
};

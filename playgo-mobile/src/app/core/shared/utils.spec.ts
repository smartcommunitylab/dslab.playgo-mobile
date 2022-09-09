/* eslint-disable no-console */
import { last, times } from 'lodash-es';
import {
  concat,
  first,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  throttleTime,
  withLatestFrom,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { framesToString, withReplayedLatestFrom } from './utils';
// import { combineLatestFromWithoutSkipping } from './utils';

describe('utils.ts', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(framesToString(actual)).toBe(framesToString(expected));
      expect(actual).toEqual(expected);
    });
  });
  describe('withLatestFromWithoutSkipping', () => {
    // it('should be function', () => {
    //   expect(combineLatestFromWithoutSkipping).toBeFunction();
    // });

    it('early target will also get emission (on spot implementation)', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const source$ = cold('----a-----|');
        const target$ = cold('-s-----t--|');
        const expected = '    ----s-----|';

        const sharedTarget = target$.pipe(shareReplay(1));
        sharedTarget.subscribe();
        const result$ = source$.pipe(
          switchMap((sourceVal) =>
            sharedTarget.pipe(
              first(),
              map((targetVal) => [sourceVal, targetVal] as [string, string])
            )
          )
        );

        expectObservable(result$).toBe(expected, { s: ['a', 's'] });
      });
    });

    it('early target will also get emission', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const source$ = cold('----a-----|');
        const target$ = cold('-s-----t--|');
        const expected = '    ----s-----|';

        const result$ = source$.pipe(withReplayedLatestFrom(target$));

        expectObservable(result$).toBe(expected, {
          s: ['a', 's'],
        });
      });
    });

    it('early source will get emission', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const source$ = cold('-a-----b----|');
        const target$ = cold('----s----t--|');
        const expected = '    ----m--n----|';

        const result$ = source$.pipe(withReplayedLatestFrom(target$));

        expectObservable(result$).toBe(expected, {
          m: ['a', 's'],
          n: ['b', 's'],
        });
      });
    });

    it('multiple early source will get emissions', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const source$ = cold('-a-b--------c---d-|');
        const target$ = cold('-----s--------t---|');
        const expected = '    -----(mn)---o---p-|';

        const result$ = source$.pipe(withReplayedLatestFrom(target$));

        expectObservable(result$).toBe(expected, {
          m: ['a', 's'],
          n: ['b', 's'],
          o: ['c', 's'],
          p: ['d', 't'],
        });
      });
    });

    it('emit only one target value', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const source$ = cold('-a-------b----------|');
        const target$ = cold('---s---t---u----v---|');
        const expected = '    ---m-----n----------|';

        const result$ = source$.pipe(withReplayedLatestFrom(target$));

        expectObservable(result$).toBe(expected, {
          m: ['a', 's'],
          n: ['b', 't'],
        });
      });
    });

    it('test subscriptions', () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable, expectSubscriptions } = helpers;
        const source1$ = cold('-a-b-c|');
        const source2$ = cold('-d-e-f|');
        const final$ = concat(source1$, source2$);

        const expected = '-a-b-c-d-e-f|';
        const expectedSubscriptionsSource1 = '^-----!';
        const expectedSubscriptionsSource2 = '------^-----!';

        expectObservable(final$).toBe(expected);
        expectSubscriptions(source1$.subscriptions).toBe(
          expectedSubscriptionsSource1
        );
        expectSubscriptions(source2$.subscriptions).toBe(
          expectedSubscriptionsSource2
        );
      });
    });
  });
});

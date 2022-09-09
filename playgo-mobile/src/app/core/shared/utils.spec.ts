import { concat, map, throttleTime, withLatestFrom } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { withLatestFromWithoutSkipping } from './utils';

describe('utils.ts', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // expect(actual).toEqual('aaa');
      expect(actual).toEqual(expected);
    });
  });
  describe('withLatestFromWithoutSkipping', () => {
    it('should be function', () => {
      expect(withLatestFromWithoutSkipping).toBeFunction();
    });

    it('1 if there is no source emission before target emission, it should behave like withLatestFrom', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const expectedValues = {
          x: ['a', 's'],
          y: ['b', 't'],
          z: ['c', 't'],
        };
        const source$ = cold('  -a---b---c--|');
        const target$ = cold('  s--t--------|');
        const expected = '      -x---y---z--|';
        // const expected = cold('-x---y---z--|', values);

        // const result$ = source$.pipe(withLatestFrom(target$));
        const result$ = source$.pipe(withLatestFromWithoutSkipping(target$));

        expectObservable(result$).toBe(expected, expectedValues);
      });
    });
    it('2 if there is only one source emission before target emission, it should behave like withLatestFrom', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const expectedValues = {
          x: ['a', 's'],
          y: ['b', 't'],
          z: ['c', 't'],
        };
        const source$ = cold('  -a---b---c--|');
        const target$ = cold('  --s-t-------|');
        const expected = '      --x--y---z--|';
        // const expected = cold('-x---y---z--|', values);

        const result$ = source$.pipe(withLatestFrom(target$));
        // const result$ = source$.pipe(withLatestFromWithoutSkipping(target$));

        expectObservable(result$).toBe(expected, expectedValues);
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

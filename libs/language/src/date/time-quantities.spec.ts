import { parseUTCDate as d } from '.';
import { addTime } from './time-quantities';

it('can add time quantities to a date', () => {
  expect(addTime(d('2020'), 'decade', 1n)).toEqual(d('2030'));

  // Rolling over powered by the JS Date API
  expect(addTime(d('2020-01-01'), 'second', 69n)).toEqual(
    d('2020-01-01T00:01:09')
  );
});

it("rounds down the day if it's over the end of a month", () => {
  // February is a good example
  expect(addTime(d('2020-01-31'), 'month', 1n)).toEqual(d('2020-02-29'));
  expect(addTime(d('2021-01-31'), 'month', 1n)).toEqual(d('2021-02-28'));

  // Same thing but with DST -- we use Date.UTC but just in case
  expect(addTime(d('2020-05-31'), 'month', 1n)).toEqual(d('2020-06-30'));

  // How about an entire year?
  expect(addTime(d('2020-02-29'), 'year', 1n)).toEqual(d('2021-02-28'));
});

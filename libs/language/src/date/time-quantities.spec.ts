import { parseUTCDate as d } from '.';
import { TimeQuantity } from '../interpreter/Value';
import {
  addTimeQuantities,
  addTimeQuantity,
  negateTimeQuantity,
} from './time-quantities';

it('can add composite quantities', () => {
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ year: 1 }))
  ).toEqual(d('2021-01-01'));

  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ quarter: 1, month: 1 }))
  ).toEqual(d('2020-05-01'));
});

it('can add two time quantities', () => {
  expect(
    addTimeQuantities(
      new TimeQuantity({ year: 1, quarter: 1 }),
      new TimeQuantity({ year: 1, month: 2 })
    )
  ).toMatchInlineSnapshot(`TimeQuantity({ year: 2, quarter: 1, month: 2 })`);

  expect(
    addTimeQuantities(
      new TimeQuantity({ hour: 1 }),
      new TimeQuantity({ second: 1 })
    )
  ).toMatchInlineSnapshot(`TimeQuantity({ hour: 1, second: 1 })`);
});

it('can add time quantities to a date', () => {
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ day: 10 }))
  ).toEqual(d('2020-01-11'));

  expect(
    addTimeQuantity(
      d('2020-01-01'),
      new TimeQuantity({ minute: 10, second: 1 })
    )
  ).toEqual(d('2020-01-01T00:10:01'));

  // Rolling over powered by the JS Date API
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ second: 69 }))
  ).toEqual(d('2020-01-01T00:01:09'));
});

it("rounds down the day if it's over the end of a month", () => {
  // February is a good example
  expect(
    addTimeQuantity(d('2020-01-31'), new TimeQuantity({ month: 1 }))
  ).toEqual(d('2020-02-29'));
  expect(
    addTimeQuantity(d('2021-01-31'), new TimeQuantity({ month: 1 }))
  ).toEqual(d('2021-02-28'));

  // Same thing but with DST -- we use Date.UTC but just in case
  expect(
    addTimeQuantity(d('2020-05-31'), new TimeQuantity({ month: 1 }))
  ).toEqual(d('2020-06-30'));

  // How about an entire year?
  expect(
    addTimeQuantity(d('2020-02-29'), new TimeQuantity({ year: 1 }))
  ).toEqual(d('2021-02-28'));
});

it('can negate a time quantity', () => {
  expect(
    negateTimeQuantity(
      new TimeQuantity({
        year: -1,
        month: 12,
        second: 42,
      })
    )
  ).toMatchInlineSnapshot(`TimeQuantity({ year: 1, month: -12, second: -42 })`);
});

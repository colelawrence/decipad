import { convertTimeQuantityTo, parseUTCDate as d, TimeQuantity } from '.';
import { addTimeQuantity } from './time-quantities';

it('can add composite quantities', () => {
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ year: 1n }))
  ).toEqual(d('2021-01-01'));

  expect(
    addTimeQuantity(
      d('2020-01-01'),
      new TimeQuantity({ quarter: 1n, month: 1n })
    )
  ).toEqual(d('2020-05-01'));

  expect(
    addTimeQuantity(d('2020'), new TimeQuantity({ decade: 1n, year: 1n }))
  ).toEqual(d('2031'));
});

it('can add time quantities to a date', () => {
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ day: 10n }))
  ).toEqual(d('2020-01-11'));

  expect(
    addTimeQuantity(
      d('2020-01-01'),
      new TimeQuantity({ minute: 10n, second: 1n })
    )
  ).toEqual(d('2020-01-01T00:10:01'));

  // Rolling over powered by the JS Date API
  expect(
    addTimeQuantity(d('2020-01-01'), new TimeQuantity({ second: 69n }))
  ).toEqual(d('2020-01-01T00:01:09'));
});

it("rounds down the day if it's over the end of a month", () => {
  // February is a good example
  expect(
    addTimeQuantity(d('2020-01-31'), new TimeQuantity({ month: 1n }))
  ).toEqual(d('2020-02-29'));
  expect(
    addTimeQuantity(d('2021-01-31'), new TimeQuantity({ month: 1n }))
  ).toEqual(d('2021-02-28'));

  // Same thing but with DST -- we use Date.UTC but just in case
  expect(
    addTimeQuantity(d('2020-05-31'), new TimeQuantity({ month: 1n }))
  ).toEqual(d('2020-06-30'));

  // How about an entire year?
  expect(
    addTimeQuantity(d('2020-02-29'), new TimeQuantity({ year: 1n }))
  ).toEqual(d('2021-02-28'));
});

it('can convert time units to other units', () => {
  expect(
    convertTimeQuantityTo(new TimeQuantity({}), 'minute')
  ).toMatchInlineSnapshot(`Fraction(0)`);

  expect(
    convertTimeQuantityTo(new TimeQuantity({ minute: 10n }), 'minute')
  ).toMatchInlineSnapshot(`Fraction(10)`);

  expect(
    convertTimeQuantityTo(
      new TimeQuantity({ minute: 10n, second: 60n }),
      'minute'
    )
  ).toMatchInlineSnapshot(`Fraction(11)`);

  expect(
    convertTimeQuantityTo(
      new TimeQuantity({ minute: 1n, second: 9n }),
      'second'
    )
  ).toMatchInlineSnapshot(`Fraction(69)`);
});

// eslint-disable-next-line no-restricted-imports
import { Time, Value, buildType as t } from '@decipad/language-types';
import { makeContext } from '../utils/testUtils';
import { miscOperators as operators } from './misc-operators';
import type { FullBuiltinSpec } from '../interfaces';

it('knows whether a range contains a value', async () => {
  expect(
    await (operators.contains as FullBuiltinSpec).fnValuesNoAutomap?.(
      [
        new Value.Range({ start: Value.fromJS(1), end: Value.fromJS(2) }),
        Value.fromJS(1),
      ],
      [t.range(t.number()), t.number()],
      makeContext(),
      []
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await (operators.contains as FullBuiltinSpec).fnValuesNoAutomap?.(
      [
        new Value.Range({ start: Value.fromJS(1), end: Value.fromJS(2) }),
        Value.fromJS(3),
      ],
      [t.range(t.number()), t.number()],
      makeContext(),
      []
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);

  expect(
    await (operators.contains as FullBuiltinSpec).fnValuesNoAutomap?.(
      [
        Value.DateValue.fromDateAndSpecificity(
          Time.parseUTCDate('2021-01-01'),
          'month'
        ),
        Value.DateValue.fromDateAndSpecificity(
          Time.parseUTCDate('2021-01-31'),
          'day'
        ),
      ],
      [t.date('month'), t.date('day')],
      makeContext(),
      []
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await (operators.contains as FullBuiltinSpec).fnValuesNoAutomap?.(
      [
        Value.DateValue.fromDateAndSpecificity(
          Time.parseUTCDate('2021-01-01'),
          'day'
        ),
        Value.DateValue.fromDateAndSpecificity(
          Time.parseUTCDate('2021-01-31'),
          'month'
        ),
      ],
      [t.date('day'), t.date('month')],
      makeContext(),
      []
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);
});

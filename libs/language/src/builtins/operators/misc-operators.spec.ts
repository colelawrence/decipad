import { parseUTCDate } from '../../date';
import {
  fromJS,
  DateValue as LanguageDate,
  Range,
} from '../../interpreter/Value';
import { miscOperators as operators } from './misc-operators';

it('knows whether a range contains a value', () => {
  expect(
    operators.contains.fnValues?.([
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(1),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    operators.contains.fnValues?.([
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(3),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);

  expect(
    operators.contains.fnValues?.([
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-01'), 'month'),
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-31'), 'day'),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    operators.contains.fnValues?.([
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-01'), 'day'),
      LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-31'), 'month'),
    ])
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);
});

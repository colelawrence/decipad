import { fromJS, Date as LanguageDate, Range } from '../../interpreter/Value';
import { miscOperators as operators } from './misc-operators';

it('knows whether a range contains a value', () => {
  expect(
    operators.contains.fnValues?.(
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(1)
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    operators.contains.fnValues?.(
      new Range({ start: fromJS(1), end: fromJS(2) }),
      fromJS(3)
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);

  expect(
    operators.contains.fnValues?.(
      new LanguageDate(new Date('2021-01-01').getTime(), 'month'),
      new LanguageDate(new Date('2021-01-31').getTime(), 'day')
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    operators.contains.fnValues?.(
      new LanguageDate(new Date('2021-01-01').getTime(), 'day'),
      new LanguageDate(new Date('2021-01-31').getTime(), 'month')
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);
});

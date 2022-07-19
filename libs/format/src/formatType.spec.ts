import {
  buildType as t,
  inverseExponent,
  serializeType,
} from '@decipad/language';
import produce from 'immer';
import { formatType, formatTypeToBasicString } from './formatType';
import { u, U } from './testUtils';

const locale = 'en-US';

const meter = u('meters');
const second = u('seconds');

it('type can be stringified', () => {
  expect(formatType(locale, serializeType(t.number()))).toEqual('<number>');
  expect(formatType(locale, serializeType(t.nothing()))).toEqual('nothing');
  expect(formatType(locale, serializeType(t.anything()))).toEqual('anything');
  expect(formatType(locale, serializeType(t.number([meter])))).toEqual(
    'meters'
  );
  expect(
    formatType(locale, serializeType(t.number(U([meter, second]))))
  ).toEqual('meters·second');
  expect(
    formatType(
      locale,
      serializeType(t.number([meter, inverseExponent(second)]))
    )
  ).toEqual('meters per second');

  expect(formatType(locale, serializeType(t.range(t.number())))).toEqual(
    'range of <number>'
  );

  expect(formatType(locale, serializeType(t.date('month')))).toEqual('month');

  const table = serializeType(
    t.table({
      length: 123,
      columnTypes: [t.number([meter]), t.string()],
      columnNames: ['Col1', 'Col2'],
    })
  );
  expect(formatType(locale, table)).toEqual(
    'table (123) { Col1 = meters, Col2 = <string> }'
  );

  const row = serializeType(
    t.row([t.number([meter]), t.string()], ['Col1', 'Col2'])
  );
  expect(formatType(locale, row)).toEqual(
    'row [ Col1 = meters, Col2 = <string> ]'
  );

  const col = serializeType(t.column(t.string(), 4));
  expect(formatType(locale, col)).toEqual('<string> x 4');

  const nestedCol = serializeType(t.column(t.column(t.string(), 4), 6));
  expect(formatType(locale, nestedCol)).toEqual('<string> x 4 x 6');
});

it('annotates symbol if present', () => {
  expect(
    formatType(
      locale,
      serializeType(
        produce(t.anything(), (withSymbol) => {
          // eslint-disable-next-line no-param-reassign
          withSymbol.symbol = 'T';
        })
      )
    )
  ).toEqual('anything:T');
});

it('can be stringified in basic form', () => {
  expect(
    formatTypeToBasicString(locale, serializeType(t.functionPlaceholder()))
  ).toEqual('function');
  expect(formatTypeToBasicString(locale, serializeType(t.number()))).toEqual(
    'number'
  );
  expect(
    formatTypeToBasicString(locale, serializeType(t.number([meter])))
  ).toEqual('meters');
  expect(
    formatTypeToBasicString(locale, serializeType(t.number(U([meter, second]))))
  ).toEqual('meters·second');
  expect(
    formatTypeToBasicString(
      locale,
      serializeType(t.number([meter, inverseExponent(second)]))
    )
  ).toEqual('meters per second');

  expect(
    formatTypeToBasicString(locale, serializeType(t.range(t.number())))
  ).toEqual('range');

  expect(
    formatTypeToBasicString(locale, serializeType(t.date('month')))
  ).toEqual('date(month)');

  const table = serializeType(
    t.table({
      length: 123,
      columnTypes: [t.number([meter]), t.string()],
      columnNames: ['Col1', 'Col2'],
    })
  );
  expect(formatTypeToBasicString(locale, table)).toEqual('table');

  const row = serializeType(
    t.row([t.number([meter]), t.string()], ['Col1', 'Col2'])
  );
  expect(formatTypeToBasicString(locale, row)).toEqual('row');

  const col = serializeType(t.column(t.string(), 4));
  expect(formatTypeToBasicString(locale, col)).toEqual('column');

  expect(() =>
    formatTypeToBasicString(
      locale,
      serializeType(t.number().withErrorCause(''))
    )
  ).toThrow();
});

import {
  Column,
  fromJS,
  TimeQuantity,
  Date as LanguageDate,
  Range,
  Scalar,
} from '../interpreter/Value';
import { build as t } from '../type';
import { builtins } from './builtins';
import { n } from '../utils';

it('concatenates tables', () => {
  expect(
    builtins.concatenate
      .fnValues?.(
        Column.fromNamedValues(
          [fromJS([1, 2, 3]), fromJS(['Hello', 'World', 'Sup'])],
          ['Numbers', 'Strings']
        ),

        Column.fromNamedValues(
          [fromJS([4]), fromJS(['Mate'])],
          ['Numbers', 'Strings']
        )
      )
      ?.getData()
  ).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        2,
        3,
        4,
      ],
      Array [
        "Hello",
        "World",
        "Sup",
        "Mate",
      ],
    ]
  `);

  const tNumber = (length: number) =>
    t.table({
      length,
      columnNames: ['Hello'],
      columnTypes: [t.number()],
    });

  expect(
    builtins.concatenate.functor?.([tNumber(1), tNumber(2)])
  ).toMatchObject({
    tableLength: 3,
  });
});

it('concatenates lists', () => {
  expect(
    builtins.cat.fnValuesNoAutomap?.([fromJS([1, 2, 3]), fromJS([4, 5, 6])])
  ).toMatchInlineSnapshot(`
    Column {
      "valueNames": null,
      "values": Array [
        Scalar {
          "cardinality": 1,
          "value": 1,
        },
        Scalar {
          "cardinality": 1,
          "value": 2,
        },
        Scalar {
          "cardinality": 1,
          "value": 3,
        },
        Scalar {
          "cardinality": 1,
          "value": 4,
        },
        Scalar {
          "cardinality": 1,
          "value": 5,
        },
        Scalar {
          "cardinality": 1,
          "value": 6,
        },
      ],
    }
  `);

  expect(builtins.cat.fnValuesNoAutomap?.([fromJS(1), fromJS([2, 3])]))
    .toMatchInlineSnapshot(`
    Column {
      "valueNames": null,
      "values": Array [
        Scalar {
          "cardinality": 1,
          "value": 1,
        },
        Scalar {
          "cardinality": 1,
          "value": 2,
        },
        Scalar {
          "cardinality": 1,
          "value": 3,
        },
      ],
    }
  `);

  expect(builtins.cat.fnValuesNoAutomap?.([fromJS([1, 2]), fromJS(3)]))
    .toMatchInlineSnapshot(`
    Column {
      "valueNames": null,
      "values": Array [
        Scalar {
          "cardinality": 1,
          "value": 1,
        },
        Scalar {
          "cardinality": 1,
          "value": 2,
        },
        Scalar {
          "cardinality": 1,
          "value": 3,
        },
      ],
    }
  `);
});

it('calculates columns and scalar lengths', () => {
  expect(builtins.len.functor?.([t.number()])).toMatchObject(t.number());

  expect(builtins.len.fnValuesNoAutomap?.([fromJS(2)])).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 1,
    }
  `);

  expect(builtins.len.functor?.([t.column(t.number(), 3)])).toMatchObject(
    t.number()
  );

  expect(builtins.len.fnValuesNoAutomap?.([fromJS([1, 2, 3])]))
    .toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 3,
    }
  `);
});

it('retrieves the first element of a list', () => {
  expect(builtins.first.fnValuesNoAutomap?.([fromJS(2)]))
    .toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 2,
    }
  `);

  expect(builtins.first.fnValuesNoAutomap?.([fromJS([4, 5, 6])]))
    .toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 4,
    }
  `);
});

it('retrieves the last element of a list', () => {
  expect(builtins.last.fnValuesNoAutomap?.([fromJS(2)])).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 2,
    }
  `);

  expect(builtins.last.fnValuesNoAutomap?.([fromJS([4, 5, 6])]))
    .toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 6,
    }
  `);
});

it('converts a time quantity into a number', () => {
  expect(builtins.in.fnValues?.(new TimeQuantity({ year: 2 }), fromJS('years')))
    .toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": 2,
    }
  `);
});

it('knows whether a range contains a value', () => {
  expect(
    builtins.contains.fnValues?.(
      new Range({ start: fromJS(1) as Scalar, end: fromJS(2) as Scalar }),
      fromJS(1)
    )
  ).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": true,
    }
  `);

  expect(
    builtins.contains.fnValues?.(
      new Range({ start: fromJS(1) as Scalar, end: fromJS(2) as Scalar }),
      fromJS(3)
    )
  ).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": false,
    }
  `);

  expect(
    builtins.contains.fnValues?.(
      new LanguageDate(new Date('2021-01-01').getTime(), 'month'),
      new LanguageDate(new Date('2021-01-31').getTime(), 'day')
    )
  ).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": true,
    }
  `);

  expect(
    builtins.contains.fnValues?.(
      new LanguageDate(new Date('2021-01-01').getTime(), 'day'),
      new LanguageDate(new Date('2021-01-31').getTime(), 'month')
    )
  ).toMatchInlineSnapshot(`
    Scalar {
      "cardinality": 1,
      "value": false,
    }
  `);
});

it('rounds a number', () => {
  expect(builtins.round.fn?.(1.127, 2)).toBe(1.13);
  expect(builtins.round.fn?.(112.7, 0)).toBe(113);
});

it('calculates sqrt', () => {
  expect(builtins.sqrt.fn?.(4)).toBe(2);
});

it("calculates a number's ln", () => {
  expect(builtins.ln.fn?.(Math.E)).toBe(1);
});

it('negates a boolean', () => {
  expect(builtins['!'].functor?.([t.boolean(), t.boolean()])).toMatchObject(
    t.boolean()
  );
  expect(builtins['!'].fn?.(true)).toBe(false);
  expect(builtins['!'].fn?.(false)).toBe(true);
});

it('ands two booleans', () => {
  expect(builtins['&&'].functor?.([t.boolean(), t.boolean()])).toMatchObject(
    t.boolean()
  );
  expect(builtins['&&'].fn?.(true, true)).toBe(true);
  expect(builtins['&&'].fn?.(false, true)).toBe(false);
});

it('exponentiates number with unit', () => {
  expect(
    builtins['**'].functor?.(
      [
        t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
        t.number(),
      ],

      [n('literal', 'number', 1, []), n('literal', 'number', 2, [])]
    )
  ).toMatchObject(
    t.number([{ unit: 'meters', exp: 2, multiplier: 1, known: false }])
  );

  expect(
    builtins['**'].functor?.(
      [
        t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
        t.number(),
      ],

      [n('literal', 'number', 1, []), n('literal', 'string', 'hey', [])]
    )
  ).toMatchObject(t.impossible('exponent value must be a literal number'));

  expect(
    builtins['**'].functor?.(
      [
        t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
        t.number(),
      ],

      [
        n('literal', 'number', 1, []),
        n(
          'function-call',
          n('funcref', '+'),
          n(
            'argument-list',
            n('literal', 'number', 2, []),
            n('literal', 'number', 2, [])
          )
        ),
      ]
    )
  ).toMatchObject(t.impossible('exponent value must be a literal number'));
});

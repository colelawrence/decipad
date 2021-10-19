import { Column, fromJS } from '../interpreter/Value';
import { build as t } from '../type';
import { builtins } from './builtins';

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

  expect(builtins.concatenate.functor(tNumber(1), tNumber(2))).toMatchObject({
    tableLength: 3,
  });
});

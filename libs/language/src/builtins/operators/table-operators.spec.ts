import { Column, fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { tableOperators as operators } from './table-operators';
import { F } from '../../utils';

describe('table operators', () => {
  it('concatenates tables', () => {
    expect(
      operators.concatenate
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
          Fraction(1),
          Fraction(2),
          Fraction(3),
          Fraction(4),
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
      operators.concatenate.functor?.([tNumber(1), tNumber(2)])
    ).toMatchObject({
      tableLength: 3,
    });
  });

  it('looks things up', () => {
    const tableType = t.table({
      length: 123,
      columnNames: ['Index', 'Value'],
      columnTypes: [t.string(), t.number()],
    });
    const tableValue = Column.fromNamedValues(
      [fromJS(['The Thing']), fromJS([12345])],
      ['Index', 'Value']
    );
    const { functor, fnValues } = operators.lookup;

    expect(functor?.([tableType, t.string()]).toString()).toMatchInlineSnapshot(
      `"row [ Index = <string>, Value = <number> ]"`
    );
    expect(fnValues?.(tableValue, fromJS('The Thing')).getData()).toEqual([
      'The Thing',
      F(12345),
    ]);
    expect(() =>
      fnValues?.(tableValue, fromJS('Not found'))
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not find row by index \\"Not found\\""`
    );
  });
});

// eslint-disable-next-line no-restricted-imports
import { Unknown, Value, buildType } from '@decipad/language-types';
import { makeContext } from '../../utils/testUtils';
import { getInstanceof } from '@decipad/utils';
import { N } from '@decipad/number';
import { tree } from './tree';

describe('tree', () => {
  it('needs a table as first arg', async () => {
    await expect(
      tree.fnValuesNoAutomap?.([], [], makeContext())
    ).rejects.toThrow(
      'panic: getInstanceof expected an instance of Table and got undefined'
    );
  });

  it('needs a table as first arg 2', async () => {
    await expect(
      tree.fnValuesNoAutomap?.(
        [Value.BooleanValue.fromValue(true)],
        [],
        makeContext()
      )
    ).rejects.toThrow(
      'panic: getInstanceof expected an instance of Table and got BooleanValue'
    );
  });

  it('works with an empty table', async () => {
    const treeValue = getInstanceof(
      await tree.fnValuesNoAutomap?.(
        [Value.Table.fromMapping({})],
        [],
        makeContext()
      ),
      Value.Tree
    );
    expect(treeValue.root).toEqual(Unknown);
    expect(treeValue.columns).toHaveLength(0);
    expect(treeValue.children).toHaveLength(0);
  });

  it('works with a one column table', async () => {
    const treeValue = getInstanceof(
      await tree.fnValuesNoAutomap?.(
        [
          Value.Table.fromMapping({
            a: Value.Column.fromValues(
              [1, 2, 3].map(Value.NumberValue.fromValue)
            ),
          }),
        ],
        [
          buildType.table({
            columnTypes: [buildType.number()],
            columnNames: ['a'],
          }),
        ],
        makeContext()
      ),
      Value.Tree
    );
    await expect(treeValue.root).toEqual(Unknown);
    expect(treeValue.columns).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregation": undefined,
          "name": "a",
        },
      ]
    `);
    expect(treeValue.children).toHaveLength(3);
    let i = 0;
    for (const child of treeValue.children) {
      i += 1;
      // eslint-disable-next-line no-await-in-loop
      expect(child.root).toEqual(N(i));
    }
  });

  it('aggregates unique values', async () => {
    const treeValue = getInstanceof(
      await tree.fnValuesNoAutomap?.(
        [
          Value.Table.fromMapping({
            a: Value.Column.fromValues(
              [1, 2, 2, 1].map(Value.NumberValue.fromValue)
            ),
          }),
        ],
        [
          buildType.table({
            columnTypes: [buildType.number()],
            columnNames: ['a'],
          }),
        ],
        makeContext()
      ),
      Value.Tree
    );
    await expect(treeValue.root).toEqual(Unknown);
    expect(treeValue.columns).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregation": undefined,
          "name": "a",
        },
      ]
    `);
    expect(treeValue.children).toHaveLength(2);
    let i = 0;
    for (const child of treeValue.children) {
      i += 1;
      // eslint-disable-next-line no-await-in-loop
      expect(child.root).toEqual(N(i));
    }
  });

  it('aggregates 2 col table', async () => {
    const treeValue = getInstanceof(
      await tree.fnValuesNoAutomap?.(
        [
          Value.Table.fromMapping({
            a: Value.Column.fromValues(
              [1, 3, 2, 3, 2, 3].map(Value.NumberValue.fromValue)
            ),
            b: Value.Column.fromValues(
              [1, 3, 2, 3, 2, 3].map(Value.NumberValue.fromValue)
            ),
          }),
        ],
        [
          buildType.table({
            columnTypes: [buildType.number(), buildType.number()],
            columnNames: ['a', 'b'],
          }),
        ],
        makeContext()
      ),
      Value.Tree
    );
    await expect(treeValue.root).toEqual(Unknown);
    expect(treeValue.columns).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregation": undefined,
          "name": "a",
        },
        Object {
          "aggregation": undefined,
          "name": "b",
        },
      ]
    `);
    expect(treeValue.children).toHaveLength(3);
    let i = 0;
    for (const child of treeValue.children) {
      i += 1;
      // eslint-disable-next-line no-await-in-loop
      expect(child.root).toEqual(N(i));
      expect(child.columns).toEqual([{ name: 'b' }]);
      const { children: subChildren } = child;
      expect(subChildren).toHaveLength(1);
      for (const subChild of subChildren) {
        // eslint-disable-next-line no-await-in-loop
        expect(subChild.root).toEqual(N(i));
      }
    }
  });

  it('aggregates 3 col table', async () => {
    const treeValue = getInstanceof(
      await tree.fnValuesNoAutomap?.(
        [
          Value.Table.fromMapping({
            a: Value.Column.fromValues(
              [1, 4, 2, 3, 2, 4, 1, 3, 1, 1, 4, 3, 5, 5].map(
                Value.NumberValue.fromValue
              )
            ),
            b: Value.Column.fromValues(
              [4, 1, 2, 3, 2, 1, 2, 3, 2, 1, 4, 2, 5, 2].map(
                Value.NumberValue.fromValue
              )
            ),
            c: Value.Column.fromValues(
              [3, 1, 2, 2, 1, 2, 3, 1, 5, 5, 1, 4, 3, 4].map(
                Value.NumberValue.fromValue
              )
            ),
          }),
        ],
        [
          buildType.table({
            columnTypes: [
              buildType.number(),
              buildType.number(),
              buildType.number(),
            ],
            columnNames: ['a', 'b', 'c'],
          }),
        ],
        makeContext()
      ),
      Value.Tree
    );
    await expect(treeValue.root).toEqual(Unknown);
    expect(treeValue.columns).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregation": undefined,
          "name": "a",
        },
        Object {
          "aggregation": undefined,
          "name": "b",
        },
        Object {
          "aggregation": undefined,
          "name": "c",
        },
      ]
    `);
    expect(treeValue.children).toHaveLength(5);

    let i = 0;
    for (const child of treeValue.children) {
      i += 1;
      // eslint-disable-next-line no-await-in-loop
      expect(child.root).toEqual(N(i));
      expect(child.columns).toEqual([{ name: 'b' }, { name: 'c' }]);
      const { children: subChildren } = child;
      for (const subChild of subChildren) {
        expect(subChild.columns).toEqual([{ name: 'c' }]);
      }
    }
  });

  it('type-infers 3 col table without roundings', async () => {
    await expect(
      tree.functorNoAutomap?.(
        [
          buildType.table({
            columnTypes: [
              buildType.number(),
              buildType.number(),
              buildType.number(),
            ],

            columnNames: ['a', 'b', 'c'],
          }),
        ],

        [],
        makeContext()
      )
    ).resolves.toEqual(
      buildType.tree({
        columnTypes: [
          buildType.number(),
          buildType.number(),
          buildType.number(),
        ],

        columnNames: ['a', 'b', 'c'],
      })
    );
  });

  it('type-infers 3 col table with null roundings', async () => {
    await expect(
      tree.functorNoAutomap?.(
        [
          buildType.table({
            columnTypes: [
              buildType.number(),
              buildType.number(),
              buildType.number(),
            ],

            columnNames: ['a', 'b', 'c'],
          }),
          buildType.table({
            columnTypes: [],

            columnNames: [],
          }),
        ],

        [],
        makeContext()
      )
    ).resolves.toEqual(
      buildType.tree({
        columnTypes: [
          buildType.number(),
          buildType.number(),
          buildType.number(),
        ],

        columnNames: ['a', 'b', 'c'],
      })
    );
  });
});

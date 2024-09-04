import { expect, describe, it } from 'vitest';
import { stripChildren } from './testUtils';
import { treeToRotatedTable } from './treeToRotatedTable';

describe('treeToRotatedTable', () => {
  it('transforms complete', () => {
    const schema = {
      key: 'root',
      children: [
        {
          key: 'name',
          children: [],
        },
        {
          key: 'personal',
          children: [
            { key: 'birthsday', children: [] },
            { key: 'gender', children: [] },
            {
              key: 'contact',
              children: [
                { key: 'address', children: [] },
                { key: 'zipcode', children: [] },
                { key: 'mobile', children: [] },
              ],
            },
          ],
        },
        {
          key: 'education',
          children: [
            { key: 'degree', children: [] },
            { key: 'CA', children: [] },
          ],
        },
      ],
    };

    expect(treeToRotatedTable(schema).map(stripChildren))
      .toMatchInlineSnapshot(`
        [
          [
            {
              "colspan": 1,
              "key": "name",
              "rowspan": 3,
            },
            {
              "colspan": 5,
              "key": "personal",
              "rowspan": 1,
            },
            {
              "colspan": 2,
              "key": "education",
              "rowspan": 1,
            },
          ],
          [
            {
              "colspan": 1,
              "key": "birthsday",
              "rowspan": 2,
            },
            {
              "colspan": 1,
              "key": "gender",
              "rowspan": 2,
            },
            {
              "colspan": 3,
              "key": "contact",
              "rowspan": 1,
            },
            {
              "colspan": 1,
              "key": "degree",
              "rowspan": 2,
            },
            {
              "colspan": 1,
              "key": "CA",
              "rowspan": 2,
            },
          ],
          [
            {
              "colspan": 1,
              "key": "address",
              "rowspan": 1,
            },
            {
              "colspan": 1,
              "key": "zipcode",
              "rowspan": 1,
            },
            {
              "colspan": 1,
              "key": "mobile",
              "rowspan": 1,
            },
          ],
        ]
      `);
  });
});

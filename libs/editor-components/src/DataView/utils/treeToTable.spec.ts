import { expect, describe, it } from 'vitest';
import { stripChildren } from './testUtils';
import { treeToTable } from './treeToTable';

describe('treeToTable', () => {
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

    expect(treeToTable(schema).map(stripChildren)).toMatchInlineSnapshot(`
      [
        [
          {
            "colspan": 3,
            "depth": 1,
            "key": "name",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 1,
            "depth": 3,
            "key": "personal",
            "rowspan": 5,
          },
          {
            "colspan": 2,
            "depth": 1,
            "key": "birthsday",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 2,
            "depth": 1,
            "key": "gender",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 1,
            "depth": 2,
            "key": "contact",
            "rowspan": 3,
          },
          {
            "colspan": 1,
            "depth": 1,
            "key": "address",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 1,
            "depth": 1,
            "key": "zipcode",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 1,
            "depth": 1,
            "key": "mobile",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 2,
            "depth": 2,
            "key": "education",
            "rowspan": 2,
          },
          {
            "colspan": 1,
            "depth": 1,
            "key": "degree",
            "rowspan": 1,
          },
        ],
        [
          {
            "colspan": 1,
            "depth": 1,
            "key": "CA",
            "rowspan": 1,
          },
        ],
      ]
    `);
  });
});

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

    expect(treeToTable(schema)).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "children": Array [],
            "colspan": 3,
            "depth": 1,
            "key": "name",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [],
                "key": "birthsday",
              },
              Object {
                "children": Array [],
                "key": "gender",
              },
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "key": "address",
                  },
                  Object {
                    "children": Array [],
                    "key": "zipcode",
                  },
                  Object {
                    "children": Array [],
                    "key": "mobile",
                  },
                ],
                "key": "contact",
              },
            ],
            "colspan": 1,
            "depth": 3,
            "key": "personal",
            "rowspan": 5,
            "tempChildren": Array [
              Object {
                "children": Array [],
                "colspan": 2,
                "depth": 1,
                "key": "birthsday",
                "rowspan": 1,
                "tempChildren": Array [],
              },
              Object {
                "children": Array [],
                "colspan": 2,
                "depth": 1,
                "key": "gender",
                "rowspan": 1,
                "tempChildren": Array [],
              },
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "key": "address",
                  },
                  Object {
                    "children": Array [],
                    "key": "zipcode",
                  },
                  Object {
                    "children": Array [],
                    "key": "mobile",
                  },
                ],
                "colspan": 1,
                "depth": 2,
                "key": "contact",
                "rowspan": 3,
                "tempChildren": Array [
                  Object {
                    "children": Array [],
                    "colspan": 1,
                    "depth": 1,
                    "key": "address",
                    "rowspan": 1,
                    "tempChildren": Array [],
                  },
                  Object {
                    "children": Array [],
                    "colspan": 1,
                    "depth": 1,
                    "key": "zipcode",
                    "rowspan": 1,
                    "tempChildren": Array [],
                  },
                  Object {
                    "children": Array [],
                    "colspan": 1,
                    "depth": 1,
                    "key": "mobile",
                    "rowspan": 1,
                    "tempChildren": Array [],
                  },
                ],
              },
            ],
          },
          Object {
            "children": Array [],
            "colspan": 2,
            "depth": 1,
            "key": "birthsday",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [],
            "colspan": 2,
            "depth": 1,
            "key": "gender",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [],
                "key": "address",
              },
              Object {
                "children": Array [],
                "key": "zipcode",
              },
              Object {
                "children": Array [],
                "key": "mobile",
              },
            ],
            "colspan": 1,
            "depth": 2,
            "key": "contact",
            "rowspan": 3,
            "tempChildren": Array [
              Object {
                "children": Array [],
                "colspan": 1,
                "depth": 1,
                "key": "address",
                "rowspan": 1,
                "tempChildren": Array [],
              },
              Object {
                "children": Array [],
                "colspan": 1,
                "depth": 1,
                "key": "zipcode",
                "rowspan": 1,
                "tempChildren": Array [],
              },
              Object {
                "children": Array [],
                "colspan": 1,
                "depth": 1,
                "key": "mobile",
                "rowspan": 1,
                "tempChildren": Array [],
              },
            ],
          },
          Object {
            "children": Array [],
            "colspan": 1,
            "depth": 1,
            "key": "address",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [],
            "colspan": 1,
            "depth": 1,
            "key": "zipcode",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [],
            "colspan": 1,
            "depth": 1,
            "key": "mobile",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [],
                "key": "degree",
              },
              Object {
                "children": Array [],
                "key": "CA",
              },
            ],
            "colspan": 2,
            "depth": 2,
            "key": "education",
            "rowspan": 2,
            "tempChildren": Array [
              Object {
                "children": Array [],
                "colspan": 1,
                "depth": 1,
                "key": "degree",
                "rowspan": 1,
                "tempChildren": Array [],
              },
              Object {
                "children": Array [],
                "colspan": 1,
                "depth": 1,
                "key": "CA",
                "rowspan": 1,
                "tempChildren": Array [],
              },
            ],
          },
          Object {
            "children": Array [],
            "colspan": 1,
            "depth": 1,
            "key": "degree",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
        Array [
          Object {
            "children": Array [],
            "colspan": 1,
            "depth": 1,
            "key": "CA",
            "rowspan": 1,
            "tempChildren": Array [],
          },
        ],
      ]
    `);
  });
});

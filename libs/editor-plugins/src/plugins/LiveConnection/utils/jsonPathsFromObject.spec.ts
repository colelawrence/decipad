import { jsonPathsFromObject } from './jsonPathsFromObject';

test('jsonPathsFromObject', () => {
  expect(jsonPathsFromObject({})).toMatchInlineSnapshot(`Array []`);
  expect(jsonPathsFromObject({ a: 1, b: 2 })).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [],
        "fullPathFromRoot": "a",
        "label": "a",
      },
      Object {
        "children": Array [],
        "fullPathFromRoot": "b",
        "label": "b",
      },
    ]
  `);
  expect(
    jsonPathsFromObject({ a: [1, 2, 3], b: { c: 4, d: [5, 6, 7], e: 'hey' } })
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [],
            "fullPathFromRoot": "a[0]",
            "label": "[0]",
          },
          Object {
            "children": Array [],
            "fullPathFromRoot": "a[1]",
            "label": "[1]",
          },
          Object {
            "children": Array [],
            "fullPathFromRoot": "a[2]",
            "label": "[2]",
          },
        ],
        "fullPathFromRoot": "a",
        "label": "a",
      },
      Object {
        "children": Array [
          Object {
            "children": Array [],
            "fullPathFromRoot": "b.c",
            "label": "c",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [],
                "fullPathFromRoot": "b.d[0]",
                "label": "[0]",
              },
              Object {
                "children": Array [],
                "fullPathFromRoot": "b.d[1]",
                "label": "[1]",
              },
              Object {
                "children": Array [],
                "fullPathFromRoot": "b.d[2]",
                "label": "[2]",
              },
            ],
            "fullPathFromRoot": "b.d",
            "label": "d",
          },
          Object {
            "children": Array [],
            "fullPathFromRoot": "b.e",
            "label": "e",
          },
        ],
        "fullPathFromRoot": "b",
        "label": "b",
      },
    ]
  `);
});

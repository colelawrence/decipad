import { jsonPathsFromObject } from './jsonPathsFromObject';

test('jsonPathsFromObject', () => {
  expect(jsonPathsFromObject({})).toMatchInlineSnapshot(`[]`);
  expect(jsonPathsFromObject({ a: 1, b: 2 })).toMatchInlineSnapshot(`
    [
      {
        "children": [],
        "fullPathFromRoot": "a",
        "label": "a",
      },
      {
        "children": [],
        "fullPathFromRoot": "b",
        "label": "b",
      },
    ]
  `);
  expect(
    jsonPathsFromObject({ a: [1, 2, 3], b: { c: 4, d: [5, 6, 7], e: 'hey' } })
  ).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "children": [],
            "fullPathFromRoot": "a[0]",
            "label": "[0]",
          },
          {
            "children": [],
            "fullPathFromRoot": "a[1]",
            "label": "[1]",
          },
          {
            "children": [],
            "fullPathFromRoot": "a[2]",
            "label": "[2]",
          },
        ],
        "fullPathFromRoot": "a",
        "label": "a",
      },
      {
        "children": [
          {
            "children": [],
            "fullPathFromRoot": "b.c",
            "label": "c",
          },
          {
            "children": [
              {
                "children": [],
                "fullPathFromRoot": "b.d[0]",
                "label": "[0]",
              },
              {
                "children": [],
                "fullPathFromRoot": "b.d[1]",
                "label": "[1]",
              },
              {
                "children": [],
                "fullPathFromRoot": "b.d[2]",
                "label": "[2]",
              },
            ],
            "fullPathFromRoot": "b.d",
            "label": "d",
          },
          {
            "children": [],
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

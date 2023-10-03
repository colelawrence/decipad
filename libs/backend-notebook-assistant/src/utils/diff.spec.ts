import { diff } from './diff';

describe('diff', () => {
  it('simple object diff works', () => {
    expect(diff()({ a: 1, b: 2 }, { a: 3, c: 4 })).toMatchInlineSnapshot(`
      [
        {
          "op": "remove",
          "path": "/b",
        },
        {
          "op": "replace",
          "path": "/a",
          "value": 3,
        },
        {
          "op": "add",
          "path": "/c",
          "value": 4,
        },
      ]
    `);
  });

  it('complex nested diff works', () => {
    expect(
      diff()(
        { a: 1, b: 2, c: [3, 4], d: [{ id: 'nodeid1', g: 1, h: 2 }] },
        { a: 3, b: [{ e: 1 }], c: 4, d: [{ id: 'nodeid1', h: 3, i: 4 }] }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "op": "remove",
          "path": "/d/0/g",
        },
        {
          "op": "replace",
          "path": "/a",
          "value": 3,
        },
        {
          "op": "replace",
          "path": "/b",
          "value": [
            {
              "e": 1,
            },
          ],
        },
        {
          "op": "replace",
          "path": "/c",
          "value": 4,
        },
        {
          "op": "replace",
          "path": "/d/0/h",
          "value": 3,
        },
        {
          "op": "add",
          "path": "/d/0/i",
          "value": 4,
        },
      ]
    `);
  });
});

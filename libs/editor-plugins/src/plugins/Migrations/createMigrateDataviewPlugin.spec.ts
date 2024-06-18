import { createMyPlateEditor } from '@decipad/editor-types';
import { createMigrateDataviewPlugin } from '.';

const editor = createMyPlateEditor({
  plugins: [createMigrateDataviewPlugin()],
});

describe('createMigrateDataviewPlugin', () => {
  it('7DlPaLrn-QUtW2HJrJ2ye.json', () => {
    editor.children = [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Data view for Tools_and_Infra',
                  },
                ],
                id: 'Qw2s9Yanl2ujFB31on9mL',
                type: 'table-var-name',
              },
            ],
            id: 'Hoflt4zOtaFYe0VN31uIX',
            type: 'table-caption',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'RrXgHjKbmfqesNWqANlzs',
                type: 'data-view-th',
                cellType: {
                  kind: 'string',
                },
                name: 'column1',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '1_018kl7NztCCSN0ETrur',
                type: 'data-view-th',
                cellType: {
                  kind: 'string',
                },
                name: 'column2',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'H4UlRJ_33LD1kKNY7DKvv',
                type: 'data-view-th',
                cellType: {
                  kind: 'number',
                  unit: [
                    {
                      unit: '$',
                      exp: {
                        s: '1',
                        n: '1',
                        d: '1',
                      },
                      multiplier: {
                        s: '1',
                        n: '1',
                        d: '1',
                      },
                      known: true,
                      baseQuantity: 'USD',
                      baseSuperQuantity: 'currency',
                    },
                    {
                      unit: 'months',
                      exp: {
                        s: '-1',
                        n: '1',
                        d: '1',
                      },
                      multiplier: {
                        s: '1',
                        n: '1',
                        d: '1',
                      },
                      known: true,
                      baseQuantity: 'month',
                      baseSuperQuantity: 'month',
                    },
                  ],
                },
                name: 'column3',
              },
            ],
            id: 'WAU1hAPdQitxyxxw1RPMx',
            type: 'data-view-tr',
          },
        ],
        id: 'JxlP1w7CeUPwiv3MAYqA3',
        type: 'data-view',
        varName: 'dataViewVarName',
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "children": Array [
                    Object {
                      "text": "Data view for Tools_and_Infra",
                    },
                  ],
                  "id": "Qw2s9Yanl2ujFB31on9mL",
                  "type": "data-view-name",
                },
              ],
              "id": "Hoflt4zOtaFYe0VN31uIX",
              "type": "data-view-caption",
            },
            Object {
              "children": Array [
                Object {
                  "cellType": Object {
                    "kind": "string",
                  },
                  "children": Array [
                    Object {
                      "text": "",
                    },
                  ],
                  "id": "RrXgHjKbmfqesNWqANlzs",
                  "name": "column1",
                  "type": "data-view-th",
                },
                Object {
                  "cellType": Object {
                    "kind": "string",
                  },
                  "children": Array [
                    Object {
                      "text": "",
                    },
                  ],
                  "id": "1_018kl7NztCCSN0ETrur",
                  "name": "column2",
                  "type": "data-view-th",
                },
                Object {
                  "cellType": Object {
                    "kind": "number",
                    "unit": Array [
                      Object {
                        "baseQuantity": "USD",
                        "baseSuperQuantity": "currency",
                        "exp": Object {
                          "d": "1",
                          "n": "1",
                          "s": "1",
                        },
                        "known": true,
                        "multiplier": Object {
                          "d": "1",
                          "n": "1",
                          "s": "1",
                        },
                        "unit": "$",
                      },
                      Object {
                        "baseQuantity": "month",
                        "baseSuperQuantity": "month",
                        "exp": Object {
                          "d": "1",
                          "n": "1",
                          "s": "-1",
                        },
                        "known": true,
                        "multiplier": Object {
                          "d": "1",
                          "n": "1",
                          "s": "1",
                        },
                        "unit": "months",
                      },
                    ],
                  },
                  "children": Array [
                    Object {
                      "text": "",
                    },
                  ],
                  "id": "H4UlRJ_33LD1kKNY7DKvv",
                  "name": "column3",
                  "type": "data-view-th",
                },
              ],
              "id": "WAU1hAPdQitxyxxw1RPMx",
              "type": "data-view-tr",
            },
          ],
          "expandedGroups": Array [],
          "id": "JxlP1w7CeUPwiv3MAYqA3",
          "schema": "jun-2024",
          "type": "data-view",
          "varName": "dataViewVarName",
        },
      ]
    `);
  });
});

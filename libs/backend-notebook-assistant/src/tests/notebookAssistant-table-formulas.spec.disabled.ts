import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import _document from './__fixtures__/tables.json';
import { applyOperations } from '../utils/applyOperations';

const document = _document as Document;

test('notebook assistant: table formulas', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a formula column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a column to the table that calculates the sum of the EBITDA and Capex columns'
    );

    expect(applyOperations(document, results.operations))
      .toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "[Template] How much is Apple worth? Breaking down a DCF model.",
            },
          ],
          "id": "B-CrQ-FDcW1Tlhr5HvWry",
          "type": "h1",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "Historicals",
                        },
                      ],
                      "id": "eUeg3OPTk9ggZ-7o5FYJ8",
                      "type": "table-var-name",
                    },
                    {
                      "children": [
                        {
                          "text": "EBITDA / Revenue in %",
                        },
                      ],
                      "columnId": "ZIRICXTMDn0skKhkvbCaJ",
                      "id": "hsyXw_qZXOmsZ1JUHPBYM",
                      "type": "table-column-formula",
                    },
                    {
                      "children": [
                        {
                          "text": "EBITDA - Capex - Acquistions - CashTax",
                        },
                      ],
                      "columnId": "xueeITv1HBdZD4oAOLbLs",
                      "id": "RieCxdCJ-piEHMjDzaZ5q",
                      "type": "table-column-formula",
                    },
                    {
                      "children": [
                        {
                          "text": "CashTax / EBITDA in %",
                        },
                      ],
                      "columnId": "4n4YeVjxXDJzpOR5BaXI8",
                      "id": "4YbXsQcR8D28yzyDbNuCM",
                      "type": "table-column-formula",
                    },
                    {
                      "children": [
                        {
                          "text": "EBITDA + Capex",
                        },
                      ],
                      "columnId": "dJL0HqC0ebl-ipWONyZYV",
                      "id": "257M3-k9mEQKzy1yrvATO",
                      "type": "table-column-formula",
                    },
                  ],
                  "id": "vCak_PVx22jdy1cJTfwPF",
                  "type": "table-caption",
                },
                {
                  "children": [
                    {
                      "cellType": {
                        "date": "year",
                        "kind": "date",
                      },
                      "children": [
                        {
                          "text": "Year",
                        },
                      ],
                      "id": "peBJbnUoDKgklpYknG4YV",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "anything",
                      },
                      "children": [
                        {
                          "text": "Revenue",
                        },
                      ],
                      "id": "meXkTfCqaiYESMsiCO3tQ",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "number",
                        "unit": [
                          {
                            "baseQuantity": "usdollar",
                            "baseSuperQuantity": "currency",
                            "exp": {
                              "d": "1",
                              "infinite": false,
                              "n": "1",
                              "s": "1",
                            },
                            "known": true,
                            "multiplier": {
                              "d": "1",
                              "infinite": false,
                              "n": "1",
                              "s": "1",
                            },
                            "unit": "usdollar",
                          },
                        ],
                      },
                      "children": [
                        {
                          "text": "EBITDA",
                        },
                      ],
                      "id": "3syUkRqRBnHrZGUZFNd81",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "anything",
                      },
                      "children": [
                        {
                          "text": "Capex",
                        },
                      ],
                      "id": "Vvy_BAZStOxFCqa6HTp27",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "anything",
                      },
                      "children": [
                        {
                          "text": "Acquistions",
                        },
                      ],
                      "id": "5BJqox0eq_WiBIBkXUcfW",
                      "type": "th",
                    },
                    {
                      "aggregation": "Average",
                      "cellType": {
                        "kind": "anything",
                      },
                      "children": [
                        {
                          "text": "CashTax",
                        },
                      ],
                      "id": "C_4-LAklEQTofqBxl6wkW",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "table-formula",
                      },
                      "children": [
                        {
                          "text": "EBITDAMargin",
                        },
                      ],
                      "id": "ZIRICXTMDn0skKhkvbCaJ",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "table-formula",
                      },
                      "children": [
                        {
                          "text": "FreeCashFlows",
                        },
                      ],
                      "id": "xueeITv1HBdZD4oAOLbLs",
                      "type": "th",
                    },
                    {
                      "cellType": {
                        "kind": "table-formula",
                      },
                      "children": [
                        {
                          "text": "CashTaxRate",
                        },
                      ],
                      "id": "4n4YeVjxXDJzpOR5BaXI8",
                      "type": "th",
                    },
                  ],
                  "id": "obrOrGSZ4AzLCILr5O1mc",
                  "type": "tr",
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "2018",
                        },
                      ],
                      "id": "qziVFQwERVcNMyYVcQ_-z",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$265.59  B",
                        },
                      ],
                      "id": "wGyCPC7kpcA7A7lrSnr5k",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$81.80  B",
                        },
                      ],
                      "id": "xkBXtUcQ83L8vZzsIhi_E",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$13.3 B",
                        },
                      ],
                      "id": "aE2X_J1c3f2ggxU2wIoBq",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$721 M",
                        },
                      ],
                      "id": "JBD9HFNiDG-3P1cNDilkx",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$10.41 B",
                        },
                      ],
                      "id": "NzOA0CPmEuS0Elt3meJHh",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "afi63YkflMy1ac6qN8Hy_",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "sQY4gVk8QRNmTCGygPCwx",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "aGnVlg84naKyvP68argbD",
                      "type": "td",
                    },
                  ],
                  "id": "dJL0HqC0ebl-ipWONyZYV",
                  "type": "tr",
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "2019",
                        },
                      ],
                      "id": "1TvRseLRwyJy05G41VSpQ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$260.17 B",
                        },
                      ],
                      "id": "YqTFEsTtxhC_s1QU982VW",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$76.47 B",
                        },
                      ],
                      "id": "ZdNu90EerXe8KPFxHjGx0",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$10.4 B",
                        },
                      ],
                      "id": "d2y3a1-qNffTBUQWii_zq",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$624 M",
                        },
                      ],
                      "id": "VxbkURQwCbEK33T3zVFBn",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$15.26 B",
                        },
                      ],
                      "id": "CFhwRgD3c9xlPMpqBiRVZ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "jJ47cpbQF5AI-5183Ead1",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "ckWGYd4fMNYEkvJ7CIdza",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "KXI-E1PvBJdK0rZYfqmfE",
                      "type": "td",
                    },
                  ],
                  "id": "Qed1eLFukyPBNs0d8aeBy",
                  "type": "tr",
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "2020",
                        },
                      ],
                      "id": "1qAW1QHCPRVFA7XrfbpRx",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$274.51  B",
                        },
                      ],
                      "id": "OufBLZaYQnDAYaN9WIgE9",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$77.34 B",
                        },
                      ],
                      "id": "hfurG9DVvjZrUDij7FgMg",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$7.3 B",
                        },
                      ],
                      "id": "8j5GUCF15_osJMBPnqSqz",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$1.52 B",
                        },
                      ],
                      "id": "bcNxFxQLj_vy3Md5xxiAf",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$9.50 B",
                        },
                      ],
                      "id": "D19k6XSEJNnfSgeQTtSwK",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "ZMRFN13Nqllm6nnRzWtZD",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "tXxgO4cCIOYtLt3bWLKjD",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "0WkS1xw1upv07kAy_h409",
                      "type": "td",
                    },
                  ],
                  "id": "VslRMcPR_iKzTIyBtC6uo",
                  "type": "tr",
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "2021",
                        },
                      ],
                      "id": "4vPbyPvvO7mfE1452s3pQ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$365.81 B",
                        },
                      ],
                      "id": "e17zgk1WkxFM-ozDmD8uJ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$120.23 B",
                        },
                      ],
                      "id": "bhLwVegK91ahdu0-e8-UW",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$11 B",
                        },
                      ],
                      "id": "HGULvFMyD2P05z_2aY47W",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$33 M",
                        },
                      ],
                      "id": "4s4BB5hD4bF67KWICH5Y2",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$25.38 B",
                        },
                      ],
                      "id": "SadfkfHzBHypTCxT5cwMS",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "-m-E36U8FclSSrQfX8LTc",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "VAJa-P0mBy5G5AJMQb_Hp",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "TAhgIdgxDMA53YSABtaYg",
                      "type": "td",
                    },
                  ],
                  "id": "_X3_gwjpQb7a9pGW3Nvrp",
                  "type": "tr",
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "2022",
                        },
                      ],
                      "id": "nBKguy3m_PFBX0vEFJDBo",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$394.32 B",
                        },
                      ],
                      "id": "48VmgkZ7ASk-kLsCYDdqJ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$130.54 B",
                        },
                      ],
                      "id": "1FpvTh3XFPV1JJE9_yQrP",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$10.7  B",
                        },
                      ],
                      "id": "LmUMEFNjMHI6dhX4P4zTs",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$306 M",
                        },
                      ],
                      "id": "DpSLUCJbNuhUhGMtE8IOp",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "$19.57 B",
                        },
                      ],
                      "id": "2cae5oXjZJ7OWhXBqPEi_",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "Mm9pVInwCL7V5hUwqApzS",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "YmXKlcTRLIEVHIMz-gFkZ",
                      "type": "td",
                    },
                    {
                      "children": [
                        {
                          "text": "",
                        },
                      ],
                      "id": "V-qZeex1XaxF1nFoGoFAT",
                      "type": "td",
                    },
                  ],
                  "id": "guj1AnyzhVF8Nfk91-4ll",
                  "type": "tr",
                },
              ],
              "colorScheme": "monochrome_blue",
              "hideFormulas": false,
              "id": "c9z4Gq_NFAzSQjEzufgxt",
              "type": "table",
              "version": 2,
            },
          ],
          "id": "vHiFdsiB84cKMOYn3JTr-",
          "name": "Main",
          "type": "tab",
        },
      ]
    `);
  }, 360000);

  it('can change a formula column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the last column to calculate the average of the EBITDA column instead'
    );

    expect(applyOperations(document, results.operations)).toMatchObject([
      {
        children: [
          {
            text: '[Template] How much is Apple worth? Breaking down a DCF model.',
          },
        ],
        id: 'B-CrQ-FDcW1Tlhr5HvWry',
        type: 'h1',
      },
      {
        id: 'vHiFdsiB84cKMOYn3JTr-',
        name: 'Main',
        type: 'tab',
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Historicals',
                      },
                    ],
                    id: 'eUeg3OPTk9ggZ-7o5FYJ8',
                    type: 'table-var-name',
                  },
                  {
                    children: [
                      {
                        text: 'EBITDA / Revenue in %',
                      },
                    ],
                    columnId: 'ZIRICXTMDn0skKhkvbCaJ',
                    id: 'hsyXw_qZXOmsZ1JUHPBYM',
                    type: 'table-column-formula',
                  },
                  {
                    children: [
                      {
                        text: 'EBITDA - Capex - Acquistions - CashTax',
                      },
                    ],
                    columnId: 'xueeITv1HBdZD4oAOLbLs',
                    id: 'RieCxdCJ-piEHMjDzaZ5q',
                    type: 'table-column-formula',
                  },
                  {
                    children: [
                      {
                        // TODO: we still can't guarantee the correctness of code
                        text: expect.stringContaining('EBITDA'),
                      },
                    ],
                    columnId: '4n4YeVjxXDJzpOR5BaXI8',
                    id: '4YbXsQcR8D28yzyDbNuCM',
                    type: 'table-column-formula',
                  },
                ],
                id: 'vCak_PVx22jdy1cJTfwPF',
                type: 'table-caption',
              },
              {
                children: [
                  {
                    cellType: {
                      date: 'year',
                      kind: 'date',
                    },
                    children: [
                      {
                        text: 'Year',
                      },
                    ],
                    id: 'peBJbnUoDKgklpYknG4YV',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'Revenue',
                      },
                    ],
                    id: 'meXkTfCqaiYESMsiCO3tQ',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'number',
                      unit: [
                        {
                          baseQuantity: 'usdollar',
                          baseSuperQuantity: 'currency',
                          exp: {
                            d: '1',
                            infinite: false,
                            n: '1',
                            s: '1',
                          },
                          known: true,
                          multiplier: {
                            d: '1',
                            infinite: false,
                            n: '1',
                            s: '1',
                          },
                          unit: 'usdollar',
                        },
                      ],
                    },
                    children: [
                      {
                        text: 'EBITDA',
                      },
                    ],
                    id: '3syUkRqRBnHrZGUZFNd81',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'Capex',
                      },
                    ],
                    id: 'Vvy_BAZStOxFCqa6HTp27',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'Acquistions',
                      },
                    ],
                    id: '5BJqox0eq_WiBIBkXUcfW',
                    type: 'th',
                  },
                  {
                    aggregation: 'Average',
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'CashTax',
                      },
                    ],
                    id: 'C_4-LAklEQTofqBxl6wkW',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'table-formula',
                    },
                    children: [
                      {
                        text: 'EBITDAMargin',
                      },
                    ],
                    id: 'ZIRICXTMDn0skKhkvbCaJ',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'table-formula',
                    },
                    children: [
                      {
                        text: 'FreeCashFlows',
                      },
                    ],
                    id: 'xueeITv1HBdZD4oAOLbLs',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'table-formula',
                    },
                    children: [
                      {
                        text: expect.any(String),
                      },
                    ],
                    id: '4n4YeVjxXDJzpOR5BaXI8',
                    type: 'th',
                  },
                ],
                id: 'obrOrGSZ4AzLCILr5O1mc',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '2018',
                      },
                    ],
                    id: 'qziVFQwERVcNMyYVcQ_-z',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$265.59  B',
                      },
                    ],
                    id: 'wGyCPC7kpcA7A7lrSnr5k',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$81.80  B',
                      },
                    ],
                    id: 'xkBXtUcQ83L8vZzsIhi_E',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$13.3 B',
                      },
                    ],
                    id: 'aE2X_J1c3f2ggxU2wIoBq',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$721 M',
                      },
                    ],
                    id: 'JBD9HFNiDG-3P1cNDilkx',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$10.41 B',
                      },
                    ],
                    id: 'NzOA0CPmEuS0Elt3meJHh',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'afi63YkflMy1ac6qN8Hy_',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'sQY4gVk8QRNmTCGygPCwx',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'aGnVlg84naKyvP68argbD',
                    type: 'td',
                  },
                ],
                id: 'dJL0HqC0ebl-ipWONyZYV',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '2019',
                      },
                    ],
                    id: '1TvRseLRwyJy05G41VSpQ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$260.17 B',
                      },
                    ],
                    id: 'YqTFEsTtxhC_s1QU982VW',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$76.47 B',
                      },
                    ],
                    id: 'ZdNu90EerXe8KPFxHjGx0',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$10.4 B',
                      },
                    ],
                    id: 'd2y3a1-qNffTBUQWii_zq',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$624 M',
                      },
                    ],
                    id: 'VxbkURQwCbEK33T3zVFBn',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$15.26 B',
                      },
                    ],
                    id: 'CFhwRgD3c9xlPMpqBiRVZ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'jJ47cpbQF5AI-5183Ead1',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'ckWGYd4fMNYEkvJ7CIdza',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'KXI-E1PvBJdK0rZYfqmfE',
                    type: 'td',
                  },
                ],
                id: 'Qed1eLFukyPBNs0d8aeBy',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '2020',
                      },
                    ],
                    id: '1qAW1QHCPRVFA7XrfbpRx',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$274.51  B',
                      },
                    ],
                    id: 'OufBLZaYQnDAYaN9WIgE9',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$77.34 B',
                      },
                    ],
                    id: 'hfurG9DVvjZrUDij7FgMg',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$7.3 B',
                      },
                    ],
                    id: '8j5GUCF15_osJMBPnqSqz',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$1.52 B',
                      },
                    ],
                    id: 'bcNxFxQLj_vy3Md5xxiAf',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$9.50 B',
                      },
                    ],
                    id: 'D19k6XSEJNnfSgeQTtSwK',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'ZMRFN13Nqllm6nnRzWtZD',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'tXxgO4cCIOYtLt3bWLKjD',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: '0WkS1xw1upv07kAy_h409',
                    type: 'td',
                  },
                ],
                id: 'VslRMcPR_iKzTIyBtC6uo',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '2021',
                      },
                    ],
                    id: '4vPbyPvvO7mfE1452s3pQ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$365.81 B',
                      },
                    ],
                    id: 'e17zgk1WkxFM-ozDmD8uJ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$120.23 B',
                      },
                    ],
                    id: 'bhLwVegK91ahdu0-e8-UW',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$11 B',
                      },
                    ],
                    id: 'HGULvFMyD2P05z_2aY47W',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$33 M',
                      },
                    ],
                    id: '4s4BB5hD4bF67KWICH5Y2',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$25.38 B',
                      },
                    ],
                    id: 'SadfkfHzBHypTCxT5cwMS',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: '-m-E36U8FclSSrQfX8LTc',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'VAJa-P0mBy5G5AJMQb_Hp',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'TAhgIdgxDMA53YSABtaYg',
                    type: 'td',
                  },
                ],
                id: '_X3_gwjpQb7a9pGW3Nvrp',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '2022',
                      },
                    ],
                    id: 'nBKguy3m_PFBX0vEFJDBo',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$394.32 B',
                      },
                    ],
                    id: '48VmgkZ7ASk-kLsCYDdqJ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$130.54 B',
                      },
                    ],
                    id: '1FpvTh3XFPV1JJE9_yQrP',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$10.7  B',
                      },
                    ],
                    id: 'LmUMEFNjMHI6dhX4P4zTs',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$306 M',
                      },
                    ],
                    id: 'DpSLUCJbNuhUhGMtE8IOp',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '$19.57 B',
                      },
                    ],
                    id: '2cae5oXjZJ7OWhXBqPEi_',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'Mm9pVInwCL7V5hUwqApzS',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'YmXKlcTRLIEVHIMz-gFkZ',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'V-qZeex1XaxF1nFoGoFAT',
                    type: 'td',
                  },
                ],
                id: 'guj1AnyzhVF8Nfk91-4ll',
                type: 'tr',
              },
            ],
            colorScheme: 'monochrome_blue',
            hideFormulas: false,
            id: 'c9z4Gq_NFAzSQjEzufgxt',
            type: 'table',
            version: 2,
          },
        ],
      },
    ]);
  }, 360000);
});

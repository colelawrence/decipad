import { createEditor } from 'slate';
import { normalizeCurried } from './normalizeNode';
import { normalizers } from './plugins';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import type { TEditor } from '@udecode/plate-common';
import { vi, it, expect } from 'vitest';
import {
  DataTabElement,
  ELEMENT_DATA_TAB,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  ParagraphElement,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';

vi.mock('nanoid', () => ({
  nanoid: () => 'mocked-id',
}));

const editor = createEditor() as TEditor;
editor.normalize = normalizeCurried(editor, normalizers(editor as TEditor));

const EXPECTED_NOTEBOOK = [
  {
    children: [
      {
        text: 'Welcome to Decipad!',
      },
    ],
    type: ELEMENT_TITLE,
  },
  {
    type: ELEMENT_DATA_TAB,
    children: [],
  },
  {
    children: [
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ],
    type: ELEMENT_TAB,
  },
];

it('normalizes empty notebook', () => {
  editor.children = [];
  editor.normalize();

  // Title + DataTab + Tab
  expect(editor.children).toHaveLength(3);
  expect(editor.children).toMatchObject(EXPECTED_NOTEBOOK);
});

it('shifts title to the correct place', () => {
  editor.children = [
    {
      type: ELEMENT_DATA_TAB,
      children: [],
    },
    {
      children: [
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
    {
      children: [
        {
          text: 'Welcome to Decipad!',
        },
      ],
      type: 'title',
    },
  ] as any;
  editor.normalize();

  expect(editor.children).toHaveLength(3);
  expect(editor.children).toMatchObject(EXPECTED_NOTEBOOK);
});

it('migrates old notebooks', () => {
  editor.children = [
    {
      type: ELEMENT_H1,
      children: [{ text: 'Old title' }],
    },
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Old paragraph' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toHaveLength(3);
  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'Old title',
        },
      ],
      id: 'mocked-id',
      type: 'title',
    },
    {
      type: ELEMENT_DATA_TAB,
      children: [],
    },
    {
      children: [
        {
          children: [
            {
              text: 'Old paragraph',
            },
          ],
          type: 'p',
        },
      ],
      name: 'First tab',
      id: 'mocked-id',
      type: 'tab',
    },
  ]);
});

it('fixes different order notebooks', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'my title',
        },
      ],
      type: 'title',
    },
    {
      type: ELEMENT_DATA_TAB,
      children: [],
    },
    {
      children: [
        {
          children: [
            {
              text: 'tab paragraph',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
  ]);
});

it('only allows one data tab per notebook', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "my title",
          },
        ],
        "type": "title",
      },
      {
        "children": [],
        "id": "first-one",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "tab paragraph",
              },
            ],
            "type": "p",
          },
        ],
        "type": "tab",
      },
    ]
  `);
});

it('prefer to keep the data tab with most children', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          text: 'some claculation',
        },
      ],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "my title",
          },
        ],
        "type": "title",
      },
      {
        "children": [
          {
            "text": "some claculation",
          },
        ],
        "id": "second-one",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "tab paragraph",
              },
            ],
            "type": "p",
          },
        ],
        "type": "tab",
      },
    ]
  `);
});

it('keeps the children from a data tab that is removed', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
      ],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'my title',
        },
      ],
      type: 'title',
    },
    {
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
      id: 'first-one',
      type: 'data-tab',
    },
    {
      children: [
        {
          children: [
            {
              text: 'tab paragraph',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
  ]);
});

it('Merges all children from all data tabs regarless of position.', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
      ],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'third-one',
      children: [
        {
          id: '4',
          text: '4',
        },
        {
          id: '5',
          text: '5',
        },
        {
          id: '6',
          text: '6',
        },
        {
          id: '7',
          text: '7',
        },
      ],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'my title',
        },
      ],
      type: 'title',
    },
    {
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
        {
          id: '3',
          text: 'some claculation',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '4',
          text: '4',
        },
        {
          id: '5',
          text: '5',
        },
        {
          id: '6',
          text: '6',
        },
        {
          id: '7',
          text: '7',
        },
      ],
      id: 'third-one',
      type: 'data-tab',
    },
    {
      children: [
        {
          children: [
            {
              text: 'tab paragraph',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
  ]);
});

it('fixes out of order elements', () => {
  const BROKEN_NOTEBOOK = [
    {
      id: 'title',
      type: 'title',
      children: [{ text: 'title' }],
    } satisfies TitleElement,
    {
      id: 'data-tab',
      type: 'data-tab',
      children: [],
    } satisfies DataTabElement,
    {
      id: 'p',
      type: 'p',
      children: [{ text: 'this is a paragraph' }],
    } satisfies ParagraphElement,
    {
      id: 'tab',
      type: 'tab',
      name: 'tab',
      children: [
        {
          id: 'p-2',
          type: 'p',
          children: [{ text: 'paragraph in tab' }],
        },
      ],
    } satisfies TabElement,
  ];

  editor.children = BROKEN_NOTEBOOK;
  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "title",
          },
        ],
        "id": "title",
        "type": "title",
      },
      {
        "children": [],
        "id": "data-tab",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "paragraph in tab",
              },
            ],
            "id": "p-2",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "this is a paragraph",
              },
            ],
            "id": "p",
            "type": "p",
          },
        ],
        "id": "tab",
        "name": "tab",
        "type": "tab",
      },
    ]
  `);
});

it('fixes elements that end up inside the title', () => {
  const BROKEN_NOTEBOOK = [
    {
      children: [
        {
          text: 'Digital Operations (Calculadora V3)',
        },
      ],
      type: 'title',
      id: 'wCNkRVjFu_2HJ4pbp8Uyb',
    },
    {
      children: [],
      type: 'data-tab',
      id: 'pC-A9RUdmUZ2J-hIeVFQE',
    },
    {
      children: [
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
          id: 'lNKhlJ3W04K-TsdY_SUS0',
        },
      ],
      type: 'tab',
      id: 'x6ijjJ2CCsKPjGXH8SO-V',
      name: 'New Tab',
    },
    {
      children: [
        {
          text: '',
        },
      ],
      type: 'title',
      id: 'wCNkRVjFu_2HJ4pbp8Uyb',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Cotiza tu logística respondiendo a estas simples preguntas',
              bold: true,
            },
            {
              text: '. Nos comprometemos con la máxima transparencia al fijar nuestras tarifas de servicio',
            },
          ],
          id: 'LDBThukTOAvT0dhHe3fs9',
          type: 'callout',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          id: 'G-RyENYy5LlXdbjxiJ-FN',
          type: 'img',
          url: 'https://app.decipad.com/api/pads/jlSqb8bvSJF1yod3DdJeI/attachments/KxKsFGeNKTbzegjusbUtc',
          width: 578,
        },
        {
          children: [
            {
              text: 'Responde el cuestionario indicando los valores correctos en las casillas',
              bold: true,
              highlight: true,
            },
            {
              text: ' 👇',
            },
          ],
          id: 'RNl-_4_PYyUDOAsd943r5',
          type: 'p',
        },
        {
          children: [
            {
              text: 'Mi marca gestiona',
            },
            {
              text: 'exprRef_LGgSrLX9EAcZcTi_bHK2X',
              magicnumberz: true,
            },
            {
              text: ' pedidos por mes. En donde cada orden contiene un promedio de ',
            },
            {
              text: 'exprRef_GsEhqV_nmnsdyEwjLT_Vt',
              magicnumberz: true,
            },
            {
              text: '  unidades por pedido. Cada mes tengo un ',
            },
            {
              text: 'exprRef_4yJyddOxGdHmwwdupU7TN',
              magicnumberz: true,
            },
            {
              text: ' de devoluciones.',
            },
          ],
          id: 'ffth0usuhYCySI-l1iD5v',
          type: 'p',
        },
        {
          children: [
            {
              text: 'En la gestión de pedidos, la mayoría de mis ordenes son tamaño ',
            },
            {
              text: 'exprRef_G_TrICouAmLRp4BceZb8S',
              magicnumberz: true,
            },
            {
              text: ' y el material de empaque de los pedidos es ',
            },
            {
              text: 'exprRef_O58uc7KsnLiUSzCERdFYF',
              magicnumberz: true,
            },
            {
              text: ' .',
            },
          ],
          type: 'p',
          id: 'HeWVsa4BjKkasEmJQwRFT',
        },
        {
          children: [
            {
              text: 'De cara a contar con suficiente stock  envío ',
            },
            {
              text: 'exprRef_2oycuPXPIy6Vz_FIYAcMn',
              magicnumberz: true,
            },
            {
              text: ' unidades al almacén por mes, y tengo un stock disponible equivalente a ',
            },
            {
              text: 'exprRef_OzXYB3QHGwoyw67XoUuJG',
              magicnumberz: true,
            },
            {
              text: '  meses de venta en stock.',
            },
          ],
          type: 'p',
          id: 'PQ87Ug62skskdhGMbe9iw',
        },
        {
          children: [
            {
              text: 'Por último, ',
            },
            {
              text: 'exprRef_HYTef29u9tBQ6XUxxgv_b',
              magicnumberz: true,
            },
            {
              text: ' necesitare la gestión de envío a cliente (última milla) ',
            },
          ],
          type: 'p',
          id: 'ZiVHda-C3eyIdat1rd_zv',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'PedidosMes',
                },
              ],
              id: 'VSKd22QNajMg-D6WCx2ek',
              type: 'caption',
            },
            {
              children: [
                {
                  text: '935',
                },
              ],
              id: 'TrDeh9VEJTiFUOD8zaC__',
              type: 'exp',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: 'j89Izy-gPBySgKCUkN5wm',
              type: 'slider',
              max: '3000',
              min: '300',
              step: '1',
              value: '5',
            },
          ],
          id: 'LGgSrLX9EAcZcTi-bHK2X',
          type: 'def',
          variant: 'slider',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'UnidsxPedido2',
                },
              ],
              id: 'RMNuT8nf66-IydMdHng9G',
              type: 'caption',
            },
            {
              children: [
                {
                  text: '2',
                },
              ],
              id: 'bB0wK-aX4r979XjvBYy4e',
              type: 'exp',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: 'HYZbDGqtL8JlQk7hFkNfu',
              type: 'slider',
              max: '10',
              min: '1',
              step: '1',
              value: '5',
            },
          ],
          id: 'GsEhqV_nmnsdyEwjLT-Vt',
          type: 'def',
          variant: 'slider',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'Devolucionesxmes',
                },
              ],
              type: 'structured_varname',
              id: 'cTIv3lURF4FkUsBOw0mk0',
            },
            {
              children: [
                {
                  text: '5%',
                },
              ],
              type: 'code_line_v2_code',
              id: 'deaWEesqVAjGpJaI8W6s9',
            },
          ],
          id: '4yJyddOxGdHmwwdupU7TN',
          type: 'code_line_v2',
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      text: 'Tamaño',
                    },
                  ],
                  id: 'b8qB6uOPjH-1W9HRyhf7s',
                  type: 'caption',
                },
                {
                  children: [
                    {
                      text: 'S',
                    },
                  ],
                  id: 'd25ZlMmHNhop_OxgPhJSE',
                  type: 'dropdown',
                  options: [
                    {
                      id: 'Sh_DI0i3nYT3GtcLdBzXe',
                      value: 'XS',
                    },
                    {
                      id: 'der_MGN_CO-91CZJdoPgx',
                      value: 'S',
                    },
                    {
                      id: 'xFXnyAyZMYgtURVoZ8U4Q',
                      value: 'M',
                    },
                    {
                      id: 'puzGwHhE0tUxp-db0Mzwr',
                      value: 'L',
                    },
                    {
                      id: '5BmrvYGS7oyMPVPqJrC1w',
                      value: 'XL',
                    },
                  ],
                },
              ],
              id: 'G_TrICouAmLRp4BceZb8S',
              type: 'def',
              variant: 'dropdown',
              coerceToType: {
                kind: 'string',
              },
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'Packaging',
                    },
                  ],
                  id: 'BpyPs_P64YDl1VbtB0E6r',
                  type: 'caption',
                },
                {
                  children: [
                    {
                      text: 'Propio',
                    },
                  ],
                  id: 'OLILTdZRGvVkHPx2G8pgr',
                  type: 'dropdown',
                  options: [
                    {
                      id: 'j7h20i4RI2qq2iVNd18_w',
                      value: 'Propio',
                    },
                    {
                      id: 'KMLaEdtK7Rwspo-p0ce19',
                      value: 'Del Operador',
                    },
                  ],
                },
              ],
              id: 'O58uc7KsnLiUSzCERdFYF',
              type: 'def',
              variant: 'dropdown',
              coerceToType: {
                kind: 'string',
              },
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'In_Unids',
                    },
                  ],
                  id: 'Go149EZfwTMFFQxLxmsrD',
                  type: 'caption',
                },
                {
                  children: [
                    {
                      text: '5',
                    },
                  ],
                  id: 'vjGPA-BW6OCILg4c6MGnn',
                  type: 'exp',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'iwVWGJRwdvJgJm1scC8H1',
                  type: 'slider',
                  max: '3000',
                  min: '1',
                  step: '1',
                  value: '5',
                },
              ],
              id: '2oycuPXPIy6Vz-FIYAcMn',
              type: 'def',
              variant: 'slider',
            },
          ],
          id: 'srCH7DaYbd_ib9awRf2UT',
          type: 'columns',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'Meses_Stock',
                },
              ],
              id: '_LAFLyljKLXcWsFfWakjT',
              type: 'caption',
            },
            {
              children: [
                {
                  text: '2',
                },
              ],
              id: 'IqPERmlUXolbfU35LcrBW',
              type: 'exp',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: 'PPn8irLVcxxz3jua7jLXB',
              type: 'slider',
              max: '10',
              min: '0',
              step: '1',
              value: '5',
            },
          ],
          id: 'OzXYB3QHGwoyw67XoUuJG',
          type: 'def',
          variant: 'slider',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'LastMile',
                },
              ],
              id: 'EnWDGj79sagh78PezYYve',
              type: 'caption',
            },
            {
              children: [
                {
                  text: 'Si',
                },
              ],
              id: 'QAmXIH2cMHQJE93BB0jy2',
              type: 'dropdown',
              options: [
                {
                  id: 'joQXFowEGmPT0v1LIWXfs',
                  value: 'Si',
                },
                {
                  id: 'hi5jYS7iXh8uVaRLS57IC',
                  value: 'No',
                },
              ],
            },
          ],
          id: 'HYTef29u9tBQ6XUxxgv_b',
          type: 'def',
          variant: 'dropdown',
          coerceToType: {
            kind: 'string',
          },
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      text: 'Pcs_en_pallet',
                    },
                  ],
                  id: 'OccxMkaMI8E_wPiYCA9to',
                  type: 'table-var-name',
                },
              ],
              id: 'CgCdbeAVtM4AI3HxPChdv',
              type: 'table-caption',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'Column1',
                    },
                  ],
                  id: 'O7kb58lwkyhsDH5Esh8U2',
                  type: 'th',
                  cellType: {
                    kind: 'anything',
                  },
                },
                {
                  children: [
                    {
                      text: 'Column2',
                    },
                  ],
                  id: '-HGNK66K6X0np27AZwJ9Q',
                  type: 'th',
                  cellType: {
                    kind: 'anything',
                  },
                },
              ],
              id: 'npyjyl7g1ize-KJCYpME1',
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'XS',
                    },
                  ],
                  id: 'CaZwvjS7ktlUf1TjcaZ9P',
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '1200',
                    },
                  ],
                  id: 'DIGlnb-0VHs81xJMisojf',
                  type: 'td',
                },
              ],
              id: 'ZBtbjxcdRWbwdqou_T6gJ',
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'S',
                    },
                  ],
                  id: 'fwPdDKFc9tcsLKhrXpa75',
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '800',
                    },
                  ],
                  id: '6kuHrx45WKYfm3q3MXZIV',
                  type: 'td',
                },
              ],
              id: 'gekyuFV0oKf2JOF20zQ-b',
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'M',
                    },
                  ],
                  id: 'VJPyUCMd23AOTOiitH8tH',
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '400',
                    },
                  ],
                  id: 'JnV9uaknIl0gByh_lqvaB',
                  type: 'td',
                },
              ],
              id: '1yy21T6Im1dxMVxpavawM',
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'L',
                    },
                  ],
                  id: 'qvSmNsssBhyMdorH3F6fS',
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '200',
                    },
                  ],
                  id: 'iFyAmgpZ53Pm8FrkaQED9',
                  type: 'td',
                },
              ],
              id: 'Rpx59BBzsw4doBPFQAwj9',
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'XL',
                    },
                  ],
                  id: 'qLd_EV1tV0ZmyCUuyIjv6',
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '10',
                    },
                  ],
                  id: 'IYnYnl_qsDOG-ogFohbRd',
                  type: 'td',
                },
              ],
              id: 'diUxOTA26GBqr-3tL-vIQ',
              type: 'tr',
            },
          ],
          id: 'Hk32-JGzOtCfviYzLqf8q',
          type: 'table',
          version: 2,
        },
        {
          children: [
            {
              children: [
                {
                  text: 'COST_Unit_Picking',
                },
              ],
              type: 'structured_varname',
              id: '-4KTiCmBUTwRodEkrWr5q',
            },
            {
              children: [
                {
                  text: '',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'D77ASRke0xpJhGb44b6p4',
                  type: 'smart-ref',
                  blockId: 'LGgSrLX9EAcZcTi-bHK2X',
                  columnId: null,
                  lastSeenVariableName: 'PedidosMes',
                },
                {
                  text: ' * ',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'C5_lkEozoDZd-QwxEtj2f',
                  type: 'smart-ref',
                  blockId: 'GsEhqV_nmnsdyEwjLT-Vt',
                  columnId: null,
                  lastSeenVariableName: 'UnidsxPedido2',
                },
                {
                  text: ' * 0.33 EUR',
                },
              ],
              type: 'code_line_v2_code',
              id: '3KviXwvSjILLMY1M1h51K',
            },
          ],
          id: 'sAEYChlaRRoMiUV02AHOZ',
          type: 'code_line_v2',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'COST_Order_Processing',
                },
              ],
              type: 'structured_varname',
              id: 'JSjhIfKSQoMnQyc6T4laG',
            },
            {
              children: [
                {
                  text: '',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'RoXrsJ5Rmbn_NSm3ZoP9g',
                  type: 'smart-ref',
                  blockId: 'LGgSrLX9EAcZcTi-bHK2X',
                  columnId: null,
                  lastSeenVariableName: 'PedidosMes',
                },
                {
                  text: ' * 0.90 eur',
                },
              ],
              type: 'code_line_v2_code',
              id: 'JvpdBKSL58DTSTFWF7dWI',
            },
          ],
          id: '44NQJ4Te-a4RLE27ds-dh',
          type: 'code_line_v2',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'COST_Devs_Processing',
                },
              ],
              type: 'structured_varname',
              id: '_Clw6M0Fyk0HYMMWVunKA',
            },
            {
              children: [
                {
                  text: '',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'HLY-GSRi87pIzrzTGcB4e',
                  type: 'smart-ref',
                  blockId: 'LGgSrLX9EAcZcTi-bHK2X',
                  columnId: null,
                  lastSeenVariableName: 'PedidosMes',
                },
                {
                  text: '  * ',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: 'xciz9h_j4iYpo59UmA8Rq',
                  type: 'smart-ref',
                  blockId: '4yJyddOxGdHmwwdupU7TN',
                  columnId: null,
                  lastSeenVariableName: 'Devolucionesxmes',
                },
                {
                  text: ' * 1 EUR',
                },
              ],
              type: 'code_line_v2_code',
              id: '1e-iiYUzEud2DEHmVpjWz',
            },
          ],
          id: 'tabbWI1Rsa0SMgzrgolwu',
          type: 'code_line_v2',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          id: 'HxfM8Z4tmmYlRlo5I73gj',
          type: 'p',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
          id: 'yBrMJmkiRCTYlGY1oOrT6',
        },
      ],
      type: 'title',
      id: 'wCNkRVjFu_2HJ4pbp8Uyb',
    },
    {
      children: [
        {
          text: '',
        },
      ],
      type: 'title',
      id: 'wCNkRVjFu_2HJ4pbp8Uyb',
    },
  ] as any;

  editor.children = BROKEN_NOTEBOOK;
  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "Digital Operations (Calculadora V3)",
          },
        ],
        "id": "wCNkRVjFu_2HJ4pbp8Uyb",
        "type": "title",
      },
      {
        "children": [],
        "id": "pC-A9RUdmUZ2J-hIeVFQE",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "lNKhlJ3W04K-TsdY_SUS0",
            "type": "p",
          },
          {
            "children": [
              {
                "bold": true,
                "text": "Cotiza tu logística respondiendo a estas simples preguntas",
              },
              {
                "text": ". Nos comprometemos con la máxima transparencia al fijar nuestras tarifas de servicio",
              },
            ],
            "id": "LDBThukTOAvT0dhHe3fs9",
            "type": "callout",
          },
          {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "G-RyENYy5LlXdbjxiJ-FN",
            "type": "img",
            "url": "https://app.decipad.com/api/pads/jlSqb8bvSJF1yod3DdJeI/attachments/KxKsFGeNKTbzegjusbUtc",
            "width": 578,
          },
          {
            "children": [
              {
                "bold": true,
                "highlight": true,
                "text": "Responde el cuestionario indicando los valores correctos en las casillas",
              },
              {
                "text": " 👇",
              },
            ],
            "id": "RNl-_4_PYyUDOAsd943r5",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "Mi marca gestiona",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_LGgSrLX9EAcZcTi_bHK2X",
              },
              {
                "text": " pedidos por mes. En donde cada orden contiene un promedio de ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_GsEhqV_nmnsdyEwjLT_Vt",
              },
              {
                "text": "  unidades por pedido. Cada mes tengo un ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_4yJyddOxGdHmwwdupU7TN",
              },
              {
                "text": " de devoluciones.",
              },
            ],
            "id": "ffth0usuhYCySI-l1iD5v",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "En la gestión de pedidos, la mayoría de mis ordenes son tamaño ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_G_TrICouAmLRp4BceZb8S",
              },
              {
                "text": " y el material de empaque de los pedidos es ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_O58uc7KsnLiUSzCERdFYF",
              },
              {
                "text": " .",
              },
            ],
            "id": "HeWVsa4BjKkasEmJQwRFT",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "De cara a contar con suficiente stock  envío ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_2oycuPXPIy6Vz_FIYAcMn",
              },
              {
                "text": " unidades al almacén por mes, y tengo un stock disponible equivalente a ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_OzXYB3QHGwoyw67XoUuJG",
              },
              {
                "text": "  meses de venta en stock.",
              },
            ],
            "id": "PQ87Ug62skskdhGMbe9iw",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "Por último, ",
              },
              {
                "magicnumberz": true,
                "text": "exprRef_HYTef29u9tBQ6XUxxgv_b",
              },
              {
                "text": " necesitare la gestión de envío a cliente (última milla) ",
              },
            ],
            "id": "ZiVHda-C3eyIdat1rd_zv",
            "type": "p",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "PedidosMes",
                  },
                ],
                "id": "VSKd22QNajMg-D6WCx2ek",
                "type": "caption",
              },
              {
                "children": [
                  {
                    "text": "935",
                  },
                ],
                "id": "TrDeh9VEJTiFUOD8zaC__",
                "type": "exp",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                ],
                "id": "j89Izy-gPBySgKCUkN5wm",
                "max": "3000",
                "min": "300",
                "step": "1",
                "type": "slider",
                "value": "5",
              },
            ],
            "id": "LGgSrLX9EAcZcTi-bHK2X",
            "type": "def",
            "variant": "slider",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "UnidsxPedido2",
                  },
                ],
                "id": "RMNuT8nf66-IydMdHng9G",
                "type": "caption",
              },
              {
                "children": [
                  {
                    "text": "2",
                  },
                ],
                "id": "bB0wK-aX4r979XjvBYy4e",
                "type": "exp",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                ],
                "id": "HYZbDGqtL8JlQk7hFkNfu",
                "max": "10",
                "min": "1",
                "step": "1",
                "type": "slider",
                "value": "5",
              },
            ],
            "id": "GsEhqV_nmnsdyEwjLT-Vt",
            "type": "def",
            "variant": "slider",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "Devolucionesxmes",
                  },
                ],
                "id": "cTIv3lURF4FkUsBOw0mk0",
                "type": "structured_varname",
              },
              {
                "children": [
                  {
                    "text": "5%",
                  },
                ],
                "id": "deaWEesqVAjGpJaI8W6s9",
                "type": "code_line_v2_code",
              },
            ],
            "id": "4yJyddOxGdHmwwdupU7TN",
            "type": "code_line_v2",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "Tamaño",
                      },
                    ],
                    "id": "b8qB6uOPjH-1W9HRyhf7s",
                    "type": "caption",
                  },
                  {
                    "children": [
                      {
                        "text": "S",
                      },
                    ],
                    "id": "d25ZlMmHNhop_OxgPhJSE",
                    "options": [
                      {
                        "id": "Sh_DI0i3nYT3GtcLdBzXe",
                        "value": "XS",
                      },
                      {
                        "id": "der_MGN_CO-91CZJdoPgx",
                        "value": "S",
                      },
                      {
                        "id": "xFXnyAyZMYgtURVoZ8U4Q",
                        "value": "M",
                      },
                      {
                        "id": "puzGwHhE0tUxp-db0Mzwr",
                        "value": "L",
                      },
                      {
                        "id": "5BmrvYGS7oyMPVPqJrC1w",
                        "value": "XL",
                      },
                    ],
                    "type": "dropdown",
                  },
                ],
                "coerceToType": {
                  "kind": "string",
                },
                "id": "G_TrICouAmLRp4BceZb8S",
                "type": "def",
                "variant": "dropdown",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "Packaging",
                      },
                    ],
                    "id": "BpyPs_P64YDl1VbtB0E6r",
                    "type": "caption",
                  },
                  {
                    "children": [
                      {
                        "text": "Propio",
                      },
                    ],
                    "id": "OLILTdZRGvVkHPx2G8pgr",
                    "options": [
                      {
                        "id": "j7h20i4RI2qq2iVNd18_w",
                        "value": "Propio",
                      },
                      {
                        "id": "KMLaEdtK7Rwspo-p0ce19",
                        "value": "Del Operador",
                      },
                    ],
                    "type": "dropdown",
                  },
                ],
                "coerceToType": {
                  "kind": "string",
                },
                "id": "O58uc7KsnLiUSzCERdFYF",
                "type": "def",
                "variant": "dropdown",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "In_Unids",
                      },
                    ],
                    "id": "Go149EZfwTMFFQxLxmsrD",
                    "type": "caption",
                  },
                  {
                    "children": [
                      {
                        "text": "5",
                      },
                    ],
                    "id": "vjGPA-BW6OCILg4c6MGnn",
                    "type": "exp",
                  },
                  {
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "id": "iwVWGJRwdvJgJm1scC8H1",
                    "max": "3000",
                    "min": "1",
                    "step": "1",
                    "type": "slider",
                    "value": "5",
                  },
                ],
                "id": "2oycuPXPIy6Vz-FIYAcMn",
                "type": "def",
                "variant": "slider",
              },
            ],
            "id": "srCH7DaYbd_ib9awRf2UT",
            "type": "columns",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "Meses_Stock",
                  },
                ],
                "id": "_LAFLyljKLXcWsFfWakjT",
                "type": "caption",
              },
              {
                "children": [
                  {
                    "text": "2",
                  },
                ],
                "id": "IqPERmlUXolbfU35LcrBW",
                "type": "exp",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                ],
                "id": "PPn8irLVcxxz3jua7jLXB",
                "max": "10",
                "min": "0",
                "step": "1",
                "type": "slider",
                "value": "5",
              },
            ],
            "id": "OzXYB3QHGwoyw67XoUuJG",
            "type": "def",
            "variant": "slider",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "LastMile",
                  },
                ],
                "id": "EnWDGj79sagh78PezYYve",
                "type": "caption",
              },
              {
                "children": [
                  {
                    "text": "Si",
                  },
                ],
                "id": "QAmXIH2cMHQJE93BB0jy2",
                "options": [
                  {
                    "id": "joQXFowEGmPT0v1LIWXfs",
                    "value": "Si",
                  },
                  {
                    "id": "hi5jYS7iXh8uVaRLS57IC",
                    "value": "No",
                  },
                ],
                "type": "dropdown",
              },
            ],
            "coerceToType": {
              "kind": "string",
            },
            "id": "HYTef29u9tBQ6XUxxgv_b",
            "type": "def",
            "variant": "dropdown",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "Pcs_en_pallet",
                      },
                    ],
                    "id": "OccxMkaMI8E_wPiYCA9to",
                    "type": "table-var-name",
                  },
                ],
                "id": "CgCdbeAVtM4AI3HxPChdv",
                "type": "table-caption",
              },
              {
                "children": [
                  {
                    "cellType": {
                      "kind": "anything",
                    },
                    "children": [
                      {
                        "text": "Column1",
                      },
                    ],
                    "id": "O7kb58lwkyhsDH5Esh8U2",
                    "type": "th",
                  },
                  {
                    "cellType": {
                      "kind": "anything",
                    },
                    "children": [
                      {
                        "text": "Column2",
                      },
                    ],
                    "id": "-HGNK66K6X0np27AZwJ9Q",
                    "type": "th",
                  },
                ],
                "id": "npyjyl7g1ize-KJCYpME1",
                "type": "tr",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "XS",
                      },
                    ],
                    "id": "CaZwvjS7ktlUf1TjcaZ9P",
                    "type": "td",
                  },
                  {
                    "children": [
                      {
                        "text": "1200",
                      },
                    ],
                    "id": "DIGlnb-0VHs81xJMisojf",
                    "type": "td",
                  },
                ],
                "id": "ZBtbjxcdRWbwdqou_T6gJ",
                "type": "tr",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "S",
                      },
                    ],
                    "id": "fwPdDKFc9tcsLKhrXpa75",
                    "type": "td",
                  },
                  {
                    "children": [
                      {
                        "text": "800",
                      },
                    ],
                    "id": "6kuHrx45WKYfm3q3MXZIV",
                    "type": "td",
                  },
                ],
                "id": "gekyuFV0oKf2JOF20zQ-b",
                "type": "tr",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "M",
                      },
                    ],
                    "id": "VJPyUCMd23AOTOiitH8tH",
                    "type": "td",
                  },
                  {
                    "children": [
                      {
                        "text": "400",
                      },
                    ],
                    "id": "JnV9uaknIl0gByh_lqvaB",
                    "type": "td",
                  },
                ],
                "id": "1yy21T6Im1dxMVxpavawM",
                "type": "tr",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "L",
                      },
                    ],
                    "id": "qvSmNsssBhyMdorH3F6fS",
                    "type": "td",
                  },
                  {
                    "children": [
                      {
                        "text": "200",
                      },
                    ],
                    "id": "iFyAmgpZ53Pm8FrkaQED9",
                    "type": "td",
                  },
                ],
                "id": "Rpx59BBzsw4doBPFQAwj9",
                "type": "tr",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "XL",
                      },
                    ],
                    "id": "qLd_EV1tV0ZmyCUuyIjv6",
                    "type": "td",
                  },
                  {
                    "children": [
                      {
                        "text": "10",
                      },
                    ],
                    "id": "IYnYnl_qsDOG-ogFohbRd",
                    "type": "td",
                  },
                ],
                "id": "diUxOTA26GBqr-3tL-vIQ",
                "type": "tr",
              },
            ],
            "id": "Hk32-JGzOtCfviYzLqf8q",
            "type": "table",
            "version": 2,
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "COST_Unit_Picking",
                  },
                ],
                "id": "-4KTiCmBUTwRodEkrWr5q",
                "type": "structured_varname",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                  {
                    "blockId": "LGgSrLX9EAcZcTi-bHK2X",
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "columnId": null,
                    "id": "D77ASRke0xpJhGb44b6p4",
                    "lastSeenVariableName": "PedidosMes",
                    "type": "smart-ref",
                  },
                  {
                    "text": " * ",
                  },
                  {
                    "blockId": "GsEhqV_nmnsdyEwjLT-Vt",
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "columnId": null,
                    "id": "C5_lkEozoDZd-QwxEtj2f",
                    "lastSeenVariableName": "UnidsxPedido2",
                    "type": "smart-ref",
                  },
                  {
                    "text": " * 0.33 EUR",
                  },
                ],
                "id": "3KviXwvSjILLMY1M1h51K",
                "type": "code_line_v2_code",
              },
            ],
            "id": "sAEYChlaRRoMiUV02AHOZ",
            "type": "code_line_v2",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "COST_Order_Processing",
                  },
                ],
                "id": "JSjhIfKSQoMnQyc6T4laG",
                "type": "structured_varname",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                  {
                    "blockId": "LGgSrLX9EAcZcTi-bHK2X",
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "columnId": null,
                    "id": "RoXrsJ5Rmbn_NSm3ZoP9g",
                    "lastSeenVariableName": "PedidosMes",
                    "type": "smart-ref",
                  },
                  {
                    "text": " * 0.90 eur",
                  },
                ],
                "id": "JvpdBKSL58DTSTFWF7dWI",
                "type": "code_line_v2_code",
              },
            ],
            "id": "44NQJ4Te-a4RLE27ds-dh",
            "type": "code_line_v2",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "text": "COST_Devs_Processing",
                  },
                ],
                "id": "_Clw6M0Fyk0HYMMWVunKA",
                "type": "structured_varname",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                  {
                    "blockId": "LGgSrLX9EAcZcTi-bHK2X",
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "columnId": null,
                    "id": "HLY-GSRi87pIzrzTGcB4e",
                    "lastSeenVariableName": "PedidosMes",
                    "type": "smart-ref",
                  },
                  {
                    "text": "  * ",
                  },
                  {
                    "blockId": "4yJyddOxGdHmwwdupU7TN",
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "columnId": null,
                    "id": "xciz9h_j4iYpo59UmA8Rq",
                    "lastSeenVariableName": "Devolucionesxmes",
                    "type": "smart-ref",
                  },
                  {
                    "text": " * 1 EUR",
                  },
                ],
                "id": "1e-iiYUzEud2DEHmVpjWz",
                "type": "code_line_v2_code",
              },
            ],
            "id": "tabbWI1Rsa0SMgzrgolwu",
            "type": "code_line_v2",
          },
          {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "HxfM8Z4tmmYlRlo5I73gj",
            "type": "p",
          },
          {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "yBrMJmkiRCTYlGY1oOrT6",
            "type": "p",
          },
        ],
        "id": "x6ijjJ2CCsKPjGXH8SO-V",
        "name": "New Tab",
        "type": "tab",
      },
    ]
  `);
});

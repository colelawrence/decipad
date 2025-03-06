import { it, expect } from 'vitest';
import { integrationColumnNameNormalizer } from './integration-normalizers';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate-common';
import { createNormalizer } from '../element-normalizer';
import { genericEditorNormalizer } from '../to-plate-plugin';

it('doesnt normalize column names when no columns are present', () => {
  expect(
    integrationColumnNameNormalizer([
      {
        id: '1',
        type: ELEMENT_INTEGRATION,
        children: [
          {
            id: '2',
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'varname' }],
          },
        ],
        typeMappings: {},
        timeOfLastRun: null,
        integrationType: { type: 'codeconnection', code: '' },
        isFirstRowHeader: false,
      },
      [0],
    ])
  ).toBeUndefined();
});

it('doesnt normalize column names when they are unique', () => {
  expect(
    integrationColumnNameNormalizer([
      {
        id: '1',
        type: ELEMENT_INTEGRATION,
        children: [
          {
            id: '2',
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'varname' }],
          },
          {
            id: 'column1',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column1',
            children: [{ text: '' }],
          },
          {
            id: 'column2',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column2',
            children: [{ text: '' }],
          },
          {
            id: 'column3',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column3',
            children: [{ text: '' }],
          },
        ],
        typeMappings: {},
        timeOfLastRun: null,
        integrationType: { type: 'codeconnection', code: '' },
        isFirstRowHeader: false,
      },
      [0],
    ])
  ).toBeUndefined();
});

it('changes the of latest formula if the name is a duplicate', () => {
  expect(
    integrationColumnNameNormalizer([
      {
        id: '1',
        type: ELEMENT_INTEGRATION,
        children: [
          {
            id: '2',
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'varname' }],
          },
          {
            id: 'column1',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column1',
            children: [{ text: '' }],
          },
          {
            id: 'column2',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column2',
            children: [{ text: '' }],
          },
          {
            id: 'column2',
            columnId: '',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            varName: 'column2',
            children: [{ text: '' }],
          },
        ],
        typeMappings: {},
        timeOfLastRun: null,
        integrationType: { type: 'codeconnection', code: '' },
        isFirstRowHeader: false,
      },
      [0],
    ])
  ).toMatchInlineSnapshot(`
    {
      "newProperties": {
        "columnId": "",
        "id": "column2",
        "type": "table-column-formula",
        "varName": "Column1",
      },
      "path": [
        0,
        3,
      ],
      "properties": {
        "columnId": "",
        "id": "column2",
        "type": "table-column-formula",
        "varName": "column2",
      },
      "type": "set_node",
    }
  `);
});

it('makes all column varnames unique', () => {
  const normalizer = genericEditorNormalizer('NORMALIZE_STUFF', [
    createNormalizer(ELEMENT_INTEGRATION, integrationColumnNameNormalizer),
  ]);
  const editor = createPlateEditor({ plugins: [normalizer] });

  editor.children = [
    {
      type: ELEMENT_INTEGRATION,
      id: '1',
      typeMappings: {},
      timeOfLastRun: null,
      integrationType: {
        type: 'codeconnection',
        code: '',
      },
      isFirstRowHeader: false,
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          id: '2',
          children: [{ text: 'varname' }],
        },
        {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          id: '3',
          columnId: '',
          varName: 'name',
          children: [{ text: 'hello' }],
        },
        {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          id: '4',
          columnId: '',
          varName: 'name',
          children: [{ text: 'world' }],
        },
      ],
    },
  ];

  expect(editor.children[0].children.slice(1)).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "hello",
          },
        ],
        "columnId": "",
        "id": "3",
        "type": "table-column-formula",
        "varName": "name",
      },
      {
        "children": [
          {
            "text": "world",
          },
        ],
        "columnId": "",
        "id": "4",
        "type": "table-column-formula",
        "varName": "name",
      },
    ]
  `);

  editor.normalize({ force: true });

  expect(editor.children[0].children.slice(1)).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "hello",
          },
        ],
        "columnId": "",
        "id": "3",
        "type": "table-column-formula",
        "varName": "name",
      },
      {
        "children": [
          {
            "text": "world",
          },
        ],
        "columnId": "",
        "id": "4",
        "type": "table-column-formula",
        "varName": "Column1",
      },
    ]
  `);
});

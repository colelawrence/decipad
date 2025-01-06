import { createTEditor } from '@udecode/plate-common';
import { it, expect, beforeEach } from 'vitest';
import { normalizeCurried } from '../../normalizeNode';
import { createNormalizer } from '../element-normalizer';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { migrateIntegration } from './migrate-integrations';

let editor = createTEditor();

beforeEach(() => {
  editor = createTEditor();
  editor.normalize = normalizeCurried(editor, [
    createNormalizer(ELEMENT_INTEGRATION, migrateIntegration)(editor),
  ]);
});

it('migrates correct old integration', () => {
  editor.children = [
    {
      type: ELEMENT_INTEGRATION,
      children: [{ text: 'integration-name' }],
    },
  ];

  editor.normalize();

  expect(editor.children[0]).toMatchObject({
    children: [
      {
        children: [
          {
            text: 'integration-name',
          },
        ],
        type: ELEMENT_STRUCTURED_VARNAME,
      },
    ],
    type: ELEMENT_INTEGRATION,
  });
});

it('doesnt migrate incorrect integration', () => {
  editor.children = [
    {
      type: ELEMENT_INTEGRATION,
      children: [],
    },
  ];

  editor.normalize();

  expect(editor.children[0]).toMatchObject({
    children: [],
    type: ELEMENT_INTEGRATION,
  });
});

it('migrates as much as possible if extra elements are present', () => {
  editor.children = [
    {
      type: ELEMENT_INTEGRATION,
      children: [{ type: 'wrong', children: [] }, { text: 'name' }],
    },
  ];

  editor.normalize();

  expect(editor.children[0]).toMatchObject({
    children: [
      {
        children: [
          {
            text: 'name',
          },
        ],
        type: ELEMENT_STRUCTURED_VARNAME,
      },
      {
        type: 'wrong',
        children: [],
      },
    ],
    type: ELEMENT_INTEGRATION,
  });
});

import { it, expect } from 'vitest';
import { createDataTabEditor } from './dataTabEditor';
import { ELEMENT_DATA_TAB_CHILDREN } from '@decipad/editor-types';

it('only allows data tab element children to be present', () => {
  const editor = createDataTabEditor();

  editor.children = [{ type: 'not-correct', children: [] }] as any;
  editor.normalize({ force: true });

  expect(editor.children).toMatchObject([]);
});

it('normalizes empty elements correctly', () => {
  const editor = createDataTabEditor();

  editor.children = [{ type: ELEMENT_DATA_TAB_CHILDREN, children: [] }] as any;
  editor.normalize({ force: true });

  expect(editor.children).toMatchObject([
    {
      children: [
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'structured_varname',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'code_line_v2_code',
        },
      ],
      type: 'data-tab-children',
    },
  ]);
});

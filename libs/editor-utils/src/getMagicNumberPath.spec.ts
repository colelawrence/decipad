import { it, expect } from 'vitest';
import { getMagicNumberPath } from './getMagicNumberPath';
import { MARK_MAGICNUMBER, createMyPlateEditor } from '@decipad/editor-types';

it('returns undefined if node not present', () => {
  const editor = createMyPlateEditor();
  expect(
    getMagicNumberPath(editor, { [MARK_MAGICNUMBER]: true, text: '' })
  ).toBeUndefined();
});

it('returns path if node is found', () => {
  const editor = createMyPlateEditor();
  editor.children = [
    {
      type: 'p',
      id: '1',
      children: [
        {
          [MARK_MAGICNUMBER]: true,
          text: '',
        },
      ],
    },
  ];
  expect(
    getMagicNumberPath(editor, { [MARK_MAGICNUMBER]: true, text: '' })
  ).toMatchObject([0, 0]);
});

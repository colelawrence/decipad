import { getMagicNumberPath } from './getMagicNumberPath';
import { MARK_MAGICNUMBER, createTPlateEditor } from '@decipad/editor-types';

it('returns undefined if node not present', () => {
  const editor = createTPlateEditor();
  expect(
    getMagicNumberPath(editor, { [MARK_MAGICNUMBER]: true, text: '' })
  ).toBeUndefined();
});

it('returns path if node is found', () => {
  const editor = createTPlateEditor();
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

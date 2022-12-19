import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { setSelection } from '@udecode/plate';
import { createCodeLinePlugin } from './createCodeLinePlugin';
import { codeLine } from '../NormalizeCodeBlock/testUtils';

describe('withCodeLine', () => {
  let editor: MyEditor;
  let computer: Computer;
  beforeEach(() => {
    computer = new Computer();
    editor = createTPlateEditor({
      plugins: [createCodeLinePlugin(computer)],
    });
  });

  describe('when inserting new line', () => {
    it('should insert insert 2 spaces and another new line, then move selection just after the 2 spaces', () => {
      editor.children = [
        {
          id: '1',
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'a = {}',
            },
          ],
        },
      ] as never;
      editor.selection = {
        anchor: {
          offset: 5,
          path: [0, 0],
        },
        focus: {
          offset: 5,
          path: [0, 0],
        },
      };

      editor.insertText('\n');

      expect(editor.children).toEqual([
        {
          id: '1',
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'a = {\n  \n}',
            },
          ],
        },
      ]);
      expect(editor.selection).toEqual({
        anchor: {
          offset: 8,
          path: [0, 0],
        },
        focus: {
          offset: 8,
          path: [0, 0],
        },
      });
    });
  });

  describe('when there is white space before/after the first/last non-white-space character', () => {
    it('should be removed', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: '   \ncode\n  ' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      setSelection(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      expect(editor.children).toEqual([
        codeLine('code'),
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    });
  });

  describe('when there is white space before/after the first/last non-white-space character in a smart ref', () => {
    it('should not be removed', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [
            { text: '' },
            { type: 'smartRef', id: '1', children: [{ text: '  code  ' }] },
            { text: '' },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      setSelection(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      expect(editor.children).toEqual([
        {
          type: ELEMENT_CODE_LINE,
          children: [
            { text: '' },
            { type: 'smartRef', id: '1', children: [{ text: '  code  ' }] },
            { text: '' },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    });
  });

  describe('when there is no space before "="', () => {
    it('should insert space before', () => {
      editor.children = [
        codeLine('a='),
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ] as any;

      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      setSelection(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      expect(editor.children).toEqual([
        codeLine('a ='),
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    });
  });

  describe('when there is no space before/after "="', () => {
    it('should insert space before/after', () => {
      editor.children = [
        codeLine('a=1'),
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ] as any;

      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      setSelection(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      expect(editor.children).toEqual([
        codeLine('a = 1'),
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    });
  });
});

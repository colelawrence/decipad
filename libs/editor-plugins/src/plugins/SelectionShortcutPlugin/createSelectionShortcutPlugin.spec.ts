import {
  createTPlateEditor,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_PARAGRAPH,
  MyEditor,
} from '@decipad/editor-types';
import { getEndPoint, getRange, getStartPoint } from '@udecode/plate';
import { Selection } from 'slate';
import { createSelectionShortcutPlugin } from './createSelectionShortcutPlugin';

const triggerKeyDownEvent = (
  editor: MyEditor,
  key: string,
  { metaKey }: { metaKey: boolean }
) => {
  const event = new KeyboardEvent('keydown', {
    key,
    metaKey,
    cancelable: true,
  });
  // @ts-expect-error DOM KeyboardEvent vs React event
  createSelectionShortcutPlugin().handlers?.onKeyDown?.(editor)(event);
};

let editor: MyEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [
      {
        key: ELEMENT_PARAGRAPH,
        isElement: true,
      },
      {
        key: ELEMENT_INLINE_NUMBER,
        isElement: true,
        isInline: true,
      },
      createSelectionShortcutPlugin(),
    ],
  });
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { text: 'Lorem ipsum' },
        { text: 'dolor sit', bold: true },
        { type: ELEMENT_INLINE_NUMBER, children: [{ text: 'amet' }] },
      ],
    } as never,
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'consectetur adipiscing elit' }],
    } as never,
  ];
});

describe('pressing cmd+a', () => {
  describe('when selection is null', () => {
    it('default behaviour should happen', () => {
      const previousSelection = editor.selection;
      triggerKeyDownEvent(editor, 'a', { metaKey: true });
      expect(editor.selection).toEqual(previousSelection);
    });
  });

  describe('when selection spans an entire element', () => {
    it('default behaviour should happen', () => {
      const previousSelection = getRange(editor, [1]);
      editor.selection = previousSelection;
      triggerKeyDownEvent(editor, 'a', { metaKey: true });
      expect(editor.selection).toEqual(previousSelection);
    });
  });

  describe('when selection spans the entire editor', () => {
    it('default behaviour should happen', () => {
      const previousSelection: Selection = {
        anchor: getStartPoint(editor, [0]),
        focus: getEndPoint(editor, [1]),
      };
      editor.selection = previousSelection;
      triggerKeyDownEvent(editor, 'a', { metaKey: true });
      expect(editor.selection).toEqual(previousSelection);
    });
  });

  describe('when selection is collapsed in one element', () => {
    it('should select the entire element', () => {
      const expectedSelection = getRange(editor, [0]);
      editor.selection = {
        focus: getStartPoint(editor, [0]),
        anchor: getStartPoint(editor, [0]),
      };
      triggerKeyDownEvent(editor, 'a', { metaKey: true });
      expect(editor.selection).toEqual(expectedSelection);
    });
  });

  describe('when selection is a sub-range of one element', () => {
    it('should select the entire element', () => {
      const expectedSelection = getRange(editor, [0]);
      editor.selection = {
        focus: getStartPoint(editor, [0, 0]),
        anchor: getStartPoint(editor, [0, 1]),
      };
      triggerKeyDownEvent(editor, 'a', { metaKey: true });
      expect(editor.selection).toEqual(expectedSelection);
    });
  });
});

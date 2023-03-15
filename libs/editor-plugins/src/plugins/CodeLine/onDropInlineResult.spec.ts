/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
import {
  CodeLineElement,
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
} from '@decipad/editor-types';
import { DragEvent } from 'react';
import { onDragStartInlineResult } from '@decipad/editor-components';
import { disable, reset } from '@decipad/feature-flags';
// eslint-disable-next-line no-restricted-imports
import * as plate from '@udecode/plate';
import { onDropInlineResult } from './onDropInlineResult';

jest.mock('@udecode/plate', () => ({
  __esModule: true,
  ...jest.requireActual('@udecode/plate'),
}));

const testStorage = new Map();

describe('onDropInlineResult', () => {
  let editor: MyEditor;
  let codeLine: CodeLineElement;
  let codeLine2: CodeLineElement;
  let testEvent: DragEvent;
  let computer: any;
  let result: any;
  let asText: string;
  beforeEach(() => {
    disable('EXPR_REFS');

    editor = createTPlateEditor();

    asText = '';

    codeLine = {
      id: 'codeline1',
      type: ELEMENT_CODE_LINE,
      children: [
        {
          text: 'a = 1km',
        },
      ],
    };

    codeLine2 = {
      id: 'codeline2',
      type: ELEMENT_CODE_LINE,
      children: [
        {
          text: '',
        },
      ],
    };

    testEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: {
        setData: (key: string, value: never) => testStorage.set(key, value),
        getData: (key: string) => testStorage.get(key),
      },
    } as unknown as DragEvent;

    jest.spyOn(plate, 'isEditorFocused').mockReturnValue(true);
    jest.spyOn(plate, 'focusEditor').mockImplementation(jest.fn());
  });

  afterEach(() => {
    reset();
  });

  describe('when dragging a code line into a paragraph', () => {
    it('should insert a magic number', () => {
      editor.children = [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '' }],
        },
        codeLine,
      ] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      onDragStartInlineResult(editor, {
        element: codeLine,
        computer,
        result,
        asText,
      })(testEvent);
      onDropInlineResult(editor)(testEvent);

      expect(editor.children).toEqual([
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ [MARK_MAGICNUMBER]: true, text: expect.any(String) }],
        },
        codeLine,
      ]);
    });
  });

  describe('when dragging a code line into a code line', () => {
    it('should insert variable name', () => {
      editor.children = [codeLine, codeLine2] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      onDragStartInlineResult(editor, {
        element: codeLine,
        computer,
        result,
        asText,
      })(testEvent);
      onDropInlineResult(editor)(testEvent);

      expect(editor.children).toEqual([
        codeLine,
        {
          ...codeLine2,
          children: [{ text: 'a' }],
        },
      ]);
    });
  });

  describe('when dragging a code line into a code line just before a character', () => {
    it('should insert variable name + whitespace', () => {
      codeLine2 = {
        id: '2',
        type: ELEMENT_CODE_LINE,
        children: [
          {
            text: 'b',
          },
        ],
      };

      editor.children = [codeLine, codeLine2] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      onDragStartInlineResult(editor, {
        element: codeLine,
        computer,
        result,
        asText,
      })(testEvent);
      onDropInlineResult(editor)(testEvent);

      expect(editor.children).toEqual([
        codeLine,
        {
          ...codeLine2,
          children: [{ text: 'a b' }],
        },
      ]);
    });
  });

  describe('when dragging a code line into a code line just after a character', () => {
    it('should insert whitespace + variable name', () => {
      codeLine2 = {
        id: '2',
        type: ELEMENT_CODE_LINE,
        children: [
          {
            text: 'b',
          },
        ],
      };

      editor.children = [codeLine, codeLine2] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });

      onDragStartInlineResult(editor, {
        element: codeLine,
        computer,
        result,
        asText,
      })(testEvent);
      onDropInlineResult(editor)(testEvent);

      expect(editor.children).toEqual([
        codeLine,
        {
          ...codeLine2,
          children: [{ text: 'b a' }],
        },
      ]);
    });
  });

  describe('when dragging a code line without declaration into a code line', () => {
    it('should insert nothing', () => {
      codeLine = {
        id: '1',
        type: ELEMENT_CODE_LINE,
        children: [
          {
            text: '2 + 2',
          },
        ],
      };

      editor.children = [codeLine, codeLine2] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      onDragStartInlineResult(editor, {
        element: codeLine,
        computer,
        result,
        asText,
      })(testEvent);
      onDropInlineResult(editor)(testEvent);

      expect(editor.children).toEqual([codeLine, codeLine2]);
    });
  });
});

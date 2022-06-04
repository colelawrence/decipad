/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MyEditor,
} from '@decipad/editor-types';
import * as plate from '@udecode/plate-core';
import { DragEvent } from 'react';
import { onDragStartTableCellResult } from '@decipad/editor-components';
import { onDropTableCellResult } from './onDropTableCellResult';

const testStorage = new Map();

describe('onDropTableCellResult', () => {
  let editor: MyEditor;
  let testEvent: DragEvent<HTMLDivElement>;
  beforeEach(() => {
    editor = createTPlateEditor();

    testEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: {
        setData: (key: string, value: never) => testStorage.set(key, value),
        getData: (key: string) => testStorage.get(key),
      },
    } as unknown as DragEvent<HTMLDivElement>;

    jest.spyOn(plate, 'isEditorFocused').mockReturnValue(true);
  });

  describe('when dragging a table cell into an empty code line', () => {
    it('should insert lookup text in that code line', () => {
      const codeLine = {
        id: '1',
        type: ELEMENT_CODE_LINE,
        children: [
          {
            text: '',
          },
        ],
      };

      editor.children = [codeLine] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      onDragStartTableCellResult(editor)({
        columnName: 'col',
        tableName: 'table',
        cellValue: 'a',
      })(testEvent);
      onDropTableCellResult(editor)(testEvent);

      expect(editor.children).toEqual([
        {
          id: '1',
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'lookup(table, "a").col',
            },
          ],
        },
      ]);
    });
  });

  describe('when dragging a table cell into a paragraph', () => {
    it('should split the paragraph and insert a code line with lookup text', () => {
      editor.children = [
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'abcd' }] },
      ] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });

      onDragStartTableCellResult(editor)({
        columnName: 'col',
        tableName: 'table',
        cellValue: 'a',
      })(testEvent);
      onDropTableCellResult(editor)(testEvent);

      expect(editor.children).toEqual([
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'ab' }] },
        {
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'lookup(table, "a").col',
            },
          ],
        },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'cd' }] },
      ]);
    });
  });

  describe('when dragging a table cell into an empty paragraph', () => {
    it('should remove that paragraph and insert a code line with lookup text', () => {
      editor.children = [
        { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
      ] as never;

      jest.spyOn(plate, 'findEventRange').mockReturnValue({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      onDragStartTableCellResult(editor)({
        columnName: 'col',
        tableName: 'table',
        cellValue: 'a',
      })(testEvent);
      onDropTableCellResult(editor)(testEvent);

      expect(editor.children).toEqual([
        {
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'lookup(table, "a").col',
            },
          ],
        },
      ]);
    });
  });
});

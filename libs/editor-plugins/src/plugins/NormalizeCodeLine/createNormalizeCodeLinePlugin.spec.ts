import { getRemoteComputer } from '@decipad/remote-computer';
import type { CodeLineElement } from '@decipad/editor-types';
import {
  createMyPlateEditor,
  createMyPlugins,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import type { PlateEditor } from '@udecode/plate-common';
import { normalizeEditor } from '@udecode/plate-common';
import { createNormalizeCodeLinePlugin } from './createNormalizeCodeLinePlugin';

function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [{ text: code }],
  } as CodeLineElement;
}

let editor: PlateEditor;
beforeEach(() => {
  const computer = getRemoteComputer();
  const plugins = createMyPlugins([createNormalizeCodeLinePlugin(computer)]);
  editor = createMyPlateEditor({
    plugins,
  }) as never;
});

describe('in a code line', () => {
  describe('when there is multiple children', () => {
    it('should merge all text', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [
            { text: 'code' },
            { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
            { text: '2' },
            { type: ELEMENT_CODE_LINE, children: [{ text: '3' }] },
          ],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('code123')]);
    });
  });

  describe('when there is marks', () => {
    it('should remove marks', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'code', bold: true, italic: false }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('code')]);
    });
  });

  describe('when code line has {b', () => {
    it('should insert "\n  " after {', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'a = {b' }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('a = {\n  b')]);
    });
  });

  describe('when code line has {}', () => {
    it('should not insert "\n  " after {', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'a = {}' }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('a = {}')]);
    });
  });

  describe('when code line has a}', () => {
    it('should insert "\n" before }', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'a = {\n  b}' }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('a = {\n  b\n}')]);
    });
  });

  describe('when code line has tab', () => {
    it('should replace it by double space', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'a = {\n\tb' }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([codeLine('a = {\n  b')]);
    });
  });
});

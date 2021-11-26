import {
  createEditorPlugins,
  ELEMENT_PARAGRAPH,
  SPEditor,
} from '@udecode/plate';
import { requireSelectionPath } from './selection';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }];
});

describe('requireSelectionPath', () => {
  it('returns the path for a collapsed selection', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(requireSelectionPath(editor)).toEqual([0, 0]);
  });
  it('throws for no selection', () => {
    editor.selection = null;
    expect(() => requireSelectionPath(editor)).toThrow(/no select/i);
  });
  it('throws for an expanded selection', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => requireSelectionPath(editor)).toThrow(/expand/i);
  });
});

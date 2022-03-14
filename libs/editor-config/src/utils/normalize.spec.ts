import { TElement } from '@udecode/plate';
import { createEditor, Editor } from 'slate';
import { mockConsoleError } from '@decipad/testutils';

import { normalizeExcessProperties } from './normalize';

describe('normalizeExcessProperties', () => {
  let editor!: Editor;
  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        extraProp: 'hi',
        children: [{ text: '', extraProp: 'hi' }],
      },
    ] as TElement[];
  });

  it('removes excess properties from a text node', () => {
    expect(editor).toHaveProperty('children.0.children.0.extraProp');
    normalizeExcessProperties(
      editor,
      Editor.node(editor, { path: [0, 0], offset: 0 })
    );
    expect(editor).not.toHaveProperty('children.0.children.0.extraProp');
  });

  it('removes excess properties from an element node', () => {
    expect(editor).toHaveProperty('children.0.extraProp');
    normalizeExcessProperties(
      editor,
      Editor.node(editor, { path: [0], offset: 0 })
    );
    expect(editor).not.toHaveProperty('children.0.extraProp');
  });

  it('returns false if no properties were removed', () => {
    editor.children = [{ type: 'p', children: [{ text: '' }] }] as TElement[];
    expect(
      normalizeExcessProperties(
        editor,
        Editor.node(editor, { path: [0], offset: 0 })
      )
    ).toBe(false);
  });
  it('returns true if properties were removed', () => {
    editor.children = [
      { type: 'p', extraProp: 'hi', children: [{ text: '' }] },
    ] as TElement[];
    expect(
      normalizeExcessProperties(
        editor,
        Editor.node(editor, { path: [0], offset: 0 })
      )
    ).toBe(true);
  });

  describe('given an absurd node', () => {
    mockConsoleError();
    it('does not allow a node to be neither element nor text', () => {
      editor.children = [{ type: 'p', children: [{}] }] as TElement[];
      expect(() =>
        normalizeExcessProperties(
          editor,
          Editor.node(editor, { path: [0, 0], offset: 0 })
        )
      ).toThrow(/element.+text/i);
    });
    it('does not allow a node to be element and text simulatenously', () => {
      editor.children = [
        { type: 'p', children: [{ text: '', children: [{ text: '' }] }] },
      ] as TElement[];
      expect(() =>
        normalizeExcessProperties(
          editor,
          Editor.node(editor, { path: [0, 0], offset: 0 })
        )
      ).toThrow(/element.+text/i);
    });
  });

  describe('allowedPropKeys', () => {
    it('exempts additional properties from removal', () => {
      normalizeExcessProperties(
        editor,
        Editor.node(editor, { path: [0], offset: 0 }),
        ['extraProp']
      );
      expect(editor).toHaveProperty('children.0.extraProp');
    });
  });
});

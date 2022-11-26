import { createTPlateEditor, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { normalizeInsertNodeText } from './normalizeInsertNodeText';

describe('when inserting an invalid text node', () => {
  it('should normalize', () => {
    const editor = createTPlateEditor();
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ] as never;

    const node = { text: '\u00a0' };

    normalizeInsertNodeText(editor, node);

    expect(node.text).toBe(' ');
  });
});

describe('when inserting an element with invalid text node', () => {
  it('should normalize', () => {
    const editor = createTPlateEditor();
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ] as never;

    const node = { text: '\u00a0' };

    normalizeInsertNodeText(editor, { type: 'p', children: [node, node] });

    expect(node.text).toBe(' ');
  });
});

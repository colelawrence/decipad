import {
  createTPlateEditor,
  ELEMENT_H1,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  MARK_BOLD,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizePlainTextBlockPlugin } from './createNormalizePlainTextBlockPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizePlainTextBlockPlugin()],
  });
});

describe.each([ELEMENT_H1] as const)('a %s text block', (type) => {
  it('cannot have extra properties', () => {
    editor.children = [
      { type, id: '42', children: [{ text: '' }], extra: true },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      { type, id: '42', children: expect.anything() },
    ] as MyElement[]);
  });

  it('can contain plain text', () => {
    editor.children = [
      {
        type,
        children: [{ text: '' }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [{ text: '' }],
      },
    ] as MyElement[]);
  });
  it('cannot contain rich text', () => {
    editor.children = [
      {
        type,
        children: [{ text: '', [MARK_BOLD]: true }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [{ text: '' }],
      },
    ] as MyElement[]);
  });

  it('cannot contain other blocks', () => {
    editor.children = [
      {
        type,
        children: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [{ text: '' }],
      },
    ] as MyElement[]);
  });
  it('cannot contain other inline elements', () => {
    editor.children = [
      {
        type,
        children: [
          {
            type: ELEMENT_LINK,
            url: 'https://example.com',
            children: [{ text: 'text' }],
          },
        ],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [{ text: 'text' }],
      },
    ] as MyElement[]);
  });
});

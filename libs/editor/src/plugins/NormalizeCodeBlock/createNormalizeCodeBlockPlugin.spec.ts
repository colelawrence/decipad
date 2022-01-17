import { Descendant, Editor } from 'slate';
import { Element } from '../../utils/elements';
import { ELEMENT_CODE_BLOCK } from '../../utils/elementTypes';
import {
  createEditorWithEmptyCodeBlock,
  createEditorWithTestNodes,
  createEmptyEditor,
  codeLine,
} from './testUtils';

describe('the normalize code block plugin', () => {
  it('keeps one line intact', () => {
    const editor = createEditorWithEmptyCodeBlock();
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = 1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = 1')],
      },
    ]);
  });

  it('keeps next empty line intact', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: codeLine(''),
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine(''),
        ],
      },
    ]);
  });

  it('joins two code lines when they belong to the same statement', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = (1\nt = {\n\n}\nb = 2')],
      },
    ]);
  });

  it('splits two or more lines when they belong to different statements', () => {
    const editor = createEditorWithEmptyCodeBlock();
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = (1\nt = {\n\n}\nb = 2',
    });
    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = (1\nt = {\n\n}\nb = 2')],
      },
    ]);
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });

  it('allows removing a bit of the first line', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = '), codeLine('t = {\n\n}'), codeLine('b = 2')],
      },
    ]);
  });

  it('allows enter after last line', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine(''),
        ],
      },
    ]);
  });

  it('allows adding some code to the new line', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });
    editor.apply({
      type: 'insert_text',
      path: [0, 3, 0],
      offset: 4,
      text: 'g = {\n\n}',
    });
    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine('g = {\n\n}'),
        ],
      },
    ]);
  });

  it('allows completely removing the content of the first line', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = 1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine(''), codeLine('t = {\n\n}'), codeLine('b = 2')],
      },
    ]);
  });

  it('applies a split and a merge at once', () => {
    const editor = createEmptyEditor();
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [codeLine('123\n(42 +'), codeLine('1337)')],
      } as Element,
    ];
    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('123'), codeLine('(42 +\n1337)')],
      },
    ]);
  });

  it('allows adding a line before the first one', () => {
    const editor = createEditorWithTestNodes();
    editor.apply({
      type: 'insert_node',
      path: [0, 0],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine(''),
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });
});

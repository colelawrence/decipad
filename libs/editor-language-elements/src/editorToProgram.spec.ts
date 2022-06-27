import {
  CodeBlockElement,
  ColumnsElement,
  MyEditor,
} from '@decipad/editor-types';
import { ParsedBlock, prettyPrintAST } from '@decipad/computer';
import { createPlateEditor } from '@udecode/plate';
import { editorToProgram } from './editorToProgram';

describe('editorToProgram', () => {
  it('creates a program out of an editor', () => {
    const editor = createPlateEditor() as MyEditor;
    editor.children = [
      { type: 'h1', id: '1', children: [{ text: '' }] },
      {
        type: 'code_line',
        id: 'line',
        children: [{ text: '1 + 1' }],
      } as unknown as CodeBlockElement,
      {
        type: 'input',
        id: 'input',
        value: '123',
        variableName: 'varName',
        children: [{ text: '' }],
        color: '',
        icon: '',
      },
      {
        type: 'columns',
        id: 'columns',
        children: [
          {
            type: 'input',
            id: 'columns/1',
            value: '12.34',
            variableName: 'a',
            icon: '',
            color: '',
            children: [{ text: '' }],
          },
          {
            type: 'input',
            id: 'columns/2',
            value: '45.67',
            variableName: 'b',
            icon: '',
            color: '',
            children: [{ text: '' }],
          },
        ],
      } as ColumnsElement,
    ];
    const { program } = editorToProgram(editor);

    expect(program.length).toBe(4);

    const [block, input, col1, col2] = program;

    expect(program.map((p) => [p.id, p.type].join(', ')))
      .toMatchInlineSnapshot(`
        Array [
          "line, unparsed-block",
          "input, parsed-block",
          "columns/1, parsed-block",
          "columns/2, parsed-block",
        ]
      `);

    expect(block).toMatchInlineSnapshot(`
      Object {
        "id": "line",
        "source": "1 + 1",
        "type": "unparsed-block",
      }
    `);

    expect(prettyPrintAST((input as ParsedBlock).block)).toMatchInlineSnapshot(`
      "(block
        (assign
          (def varName)
          123))"
    `);

    expect(prettyPrintAST((col1 as ParsedBlock).block)).toMatchInlineSnapshot(`
      "(block
        (assign
          (def a)
          12.34))"
    `);

    expect(prettyPrintAST((col2 as ParsedBlock).block)).toMatchInlineSnapshot(`
      "(block
        (assign
          (def b)
          45.67))"
    `);
  });
});

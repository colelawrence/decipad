import { CodeBlockElement } from '@decipad/editor-types';
import { ParsedBlock, prettyPrintAST } from '@decipad/language';
import { documentToProgram } from './documentToProgram';

describe('documentToProgram', () => {
  it('creates a program out of a document', () => {
    const program = documentToProgram([
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
    ]);

    expect(program.length).toBe(2);

    const [block, input] = program;
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
  });
});

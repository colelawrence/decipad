import { Computer, prettyPrintAST } from '@decipad/computer';
import { MyEditor, ELEMENT_EVAL } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { createPlateEditor } from '@udecode/plate';
import { Eval } from './Eval';

describe('Eval expression element', () => {
  it('returns result as unparsed block', async () => {
    const editor = createPlateEditor() as MyEditor;

    const el = await Eval.getParsedBlockFromElement?.(editor, new Computer(), {
      id: 'id0',
      type: ELEMENT_EVAL,
      variant: 'expression',
      children: [{ text: '1 + 1' }],
      result: '2',
    });

    expect(prettyPrintAST(getDefined(el?.[0].block))).toMatchInlineSnapshot(`
        "(block
          2)"
      `);
  });
});

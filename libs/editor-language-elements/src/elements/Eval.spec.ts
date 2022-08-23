import { Computer } from '@decipad/computer';
import { MyEditor, EvalElement, ELEMENT_EVAL } from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';
import { Eval } from './Eval';

describe('Eval expression element', () => {
  it('returns result as unparsed block', async () => {
    const editor = createPlateEditor() as MyEditor;
    expect(Eval.resultsInUnparsedBlock).toBe(true);

    const el: EvalElement = {
      id: 'id0',
      type: ELEMENT_EVAL,
      variant: 'expression',
      children: [{ text: '1 + 1' }],
      result: '2',
    };

    if (
      !('getUnparsedBlockFromElement' in Eval) ||
      !Eval.getUnparsedBlockFromElement
    ) {
      throw new Error('Show ');
    }

    expect(
      await Eval.getUnparsedBlockFromElement(editor, new Computer(), el)
    ).toMatchObject([
      {
        type: 'unparsed-block',
        id: 'id0',
        source: '2',
      },
    ]);
  });
});

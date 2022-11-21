/* eslint-disable no-loop-func */
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { isText } from '@udecode/plate';
import { act, render } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { createEditor } from './utils/createEditor';
import { EditorStack } from './utils/EditorStack';

const OP_COUNT = 10_000;
const MAX_TIME_NS = 3_000_000_000;

describe('editor operation performance', () => {
  it('performs when typing on a big document', () => {
    const { editor, computer } = createEditor('use-of-funds');
    const notebookId = nanoid();

    render(
      <EditorStack
        notebookId={notebookId}
        editor={editor}
        computer={computer}
      />
    );

    const p = editor.children[2];
    if (p.type !== ELEMENT_PARAGRAPH) {
      throw new Error('expected third child to be a paragraph');
    }

    const t1 = process.hrtime.bigint();
    const path = [2, 0];
    const text = p.children[0];
    if (!isText(text)) {
      throw new Error('expected first child of paragraph to be text');
    }
    let offset = text.text.length;
    for (let i = 0; i < OP_COUNT; i += 1) {
      act(() => {
        editor.apply({ type: 'insert_text', path, offset, text: 'k' });
        offset += 1;
      });
    }
    const t2 = process.hrtime.bigint();

    expect(t2 - t1).toBeLessThanOrEqual(MAX_TIME_NS);
  });
});

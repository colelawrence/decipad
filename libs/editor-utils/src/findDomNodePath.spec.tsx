import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { createEditor } from 'slate';
import { Editable, Slate, ReactEditor, withReact } from 'slate-react';
import { findDomNodePath } from './findDomNodePath';

describe('findDomNodePath', () => {
  it('finds the Slate Node for a DOM Node', () => {
    const editor = withReact(createEditor() as ReactEditor);
    const { getByText } = render(
      <Slate editor={editor} value={[{ text: 'text' }]} onChange={noop}>
        <Editable />
      </Slate>
    );

    expect(findDomNodePath(editor, getByText('text'))).toEqual([0]);
  });

  it('throws if given DOM Node is not part of the editor', () => {
    const editor = withReact(createEditor() as ReactEditor);
    expect(() => findDomNodePath(editor, document.body)).toThrow(/node/i);
  });
});

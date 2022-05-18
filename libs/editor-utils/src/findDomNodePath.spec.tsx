import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { Editable, Slate } from 'slate-react';
import { createTEditor, withTReact } from '@udecode/plate';
import { findDomNodePath } from './findDomNodePath';

describe('findDomNodePath', () => {
  it('finds the Slate Node for a DOM Node', () => {
    const editor = withTReact(createTEditor());
    const { getByText } = render(
      <Slate editor={editor as any} value={[{ text: 'text' }]} onChange={noop}>
        <Editable />
      </Slate>
    );

    expect(findDomNodePath(editor, getByText('text'))).toEqual([0]);
  });

  it('throws if given DOM Node is not part of the editor', () => {
    const editor = withTReact(createTEditor());
    expect(findDomNodePath(editor, document.body)).toBeUndefined();
  });
});

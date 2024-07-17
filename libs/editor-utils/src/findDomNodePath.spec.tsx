import { describe, it, expect } from 'vitest';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { Editable, Slate } from 'slate-react';
import { withTReact, createPlateEditor } from '@udecode/plate-common';
import { findDomNodePath } from './findDomNodePath';

describe('findDomNodePath', () => {
  it('finds the Slate Node for a DOM Node', () => {
    const editor = withTReact(createPlateEditor());
    const { getByText } = render(
      <Slate
        editor={editor as never}
        initialValue={[{ text: 'text' }]}
        onChange={noop}
      >
        <Editable />
      </Slate>
    );

    expect(findDomNodePath(editor, getByText('text'))).toEqual([0]);
  });

  it('throws if given DOM Node is not part of the editor', () => {
    const editor = withTReact(createPlateEditor());
    expect(findDomNodePath(editor, document.body)).toBeUndefined();
  });
});

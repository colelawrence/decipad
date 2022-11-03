import { LinkElement, MyElement, useTEditorRef } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Editable, RenderElementProps, Slate } from 'slate-react';

import { createTEditor, withTReact } from '@udecode/plate';
import { useElementMutatorCallback } from './useElementMutatorCallback';

describe('useElementMutatorCallback', () => {
  const Link: React.FC<RenderElementProps & { sideEffects: () => void }> = ({
    element,
    attributes,
    children,
    sideEffects,
  }) => {
    const [text, setText] = useState('');
    const editor = useTEditorRef();
    const mutateElement = useElementMutatorCallback(
      editor,
      element as LinkElement,
      'url',
      sideEffects
    );
    return (
      <div {...attributes}>
        <div contentEditable={false}>
          <label>
            value
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <button onClick={() => mutateElement(text)}>mutate</button>
        </div>
        {children}
      </div>
    );
  };

  it('hook tests', async () => {
    const sideEffects = jest.fn();
    const editor = withTReact(createTEditor());
    const { getByText, getByLabelText } = render(
      <Slate
        editor={editor as never}
        value={
          [
            { type: 'a', id: 'asdf', url: '', children: [{ text: '' }] },
          ] as MyElement[]
        }
        onChange={noop}
      >
        <Editable
          renderElement={(props) => (
            <Link {...props} sideEffects={sideEffects} />
          )}
        />
      </Slate>
    );

    await userEvent.type(getByLabelText('value'), 'test');
    await userEvent.click(getByText('mutate'));

    expect(editor).toHaveProperty('children.0.url', 'test');
    expect(sideEffects).toHaveBeenCalledTimes(1);
  });
});

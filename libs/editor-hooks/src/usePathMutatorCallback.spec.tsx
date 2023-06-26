import {
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, useState } from 'react';
import { Editable, Slate } from 'slate-react';

import { createTEditor, findNodePath, withTReact } from '@udecode/plate';
import { usePathMutatorCallback } from './usePathMutatorCallback';

describe('usePathMutatorCallback', () => {
  const Link: React.FC<
    ComponentProps<PlateComponent> & { sideEffects: () => void }
  > = ({ element, attributes, children, sideEffects }) => {
    const [text, setText] = useState('');
    const editor = useTEditorRef();
    const mutateElement = usePathMutatorCallback(
      editor,
      findNodePath(editor, element as MyElement),
      'url',
      'test',
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
        initialValue={
          [
            { type: 'a', id: 'asdf', url: '', children: [{ text: '' }] },
          ] as MyElement[]
        }
        onChange={noop}
      >
        <Editable
          renderElement={(props) => (
            <Link
              {...(props as ComponentProps<PlateComponent>)}
              sideEffects={sideEffects}
            />
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

import { Element, LinkElement } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createEditor } from 'slate';
import {
  Editable,
  ReactEditor,
  Slate,
  withReact,
  useSlate,
  RenderElementProps,
} from 'slate-react';

import { findDomNodePath, useElementMutatorCallback } from './slateReact';

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

describe('useElementMutatorCallback', () => {
  let effectsFn: () => void;
  beforeEach(() => {
    effectsFn = jest.fn();
  });

  const Link: React.FC<RenderElementProps> = ({
    element,
    attributes,
    children,
  }) => {
    const [text, setText] = useState('');
    const editor = useSlate() as ReactEditor;
    const mutateElement = useElementMutatorCallback(
      editor,
      element as LinkElement,
      'url',
      effectsFn
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

  it('hook tests', () => {
    const editor = withReact(createEditor() as ReactEditor);
    const { getByText, getByLabelText } = render(
      <Slate
        editor={editor}
        value={
          [
            { type: 'a', id: 'asdf', url: '', children: [{ text: '' }] },
          ] as Element[]
        }
        onChange={noop}
      >
        <Editable renderElement={(props) => <Link {...props} />} />
      </Slate>
    );

    userEvent.type(getByLabelText('value'), 'test');
    userEvent.click(getByText('mutate'));

    expect(editor).toHaveProperty('children.0.url', 'test');
  });

  it('calls effects callback', () => {
    const editor = withReact(createEditor() as ReactEditor);
    const { getByText, getByLabelText } = render(
      <Slate
        editor={editor}
        value={
          [
            { type: 'a', id: 'asdf', url: '', children: [{ text: '' }] },
          ] as Element[]
        }
        onChange={noop}
      >
        <Editable renderElement={(props) => <Link {...props} />} />
      </Slate>
    );

    expect(effectsFn).not.toHaveBeenCalled();

    userEvent.type(getByLabelText('value'), 'test');
    userEvent.click(getByText('mutate'));

    expect(effectsFn).toHaveBeenCalledTimes(1);
  });
});

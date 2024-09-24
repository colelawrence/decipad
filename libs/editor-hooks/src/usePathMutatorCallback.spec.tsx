import { it, describe, expect, vi } from 'vitest';
import type { MyElement, PlateComponent } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import {
  createPlateEditor,
  findNodePath,
  Plate,
  PlateContent,
} from '@udecode/plate-common';
import { usePathMutatorCallback } from './usePathMutatorCallback';

describe('usePathMutatorCallback', () => {
  const Link: React.FC<
    ComponentProps<PlateComponent> & { sideEffects: () => void }
  > = ({ element, attributes, children, sideEffects }) => {
    const [text, setText] = useState('');
    const editor = useMyEditorRef();
    const mutateElement = usePathMutatorCallback(
      editor,
      findNodePath(editor, element as MyElement),
      'url' as any,
      'test',
      sideEffects
    ) as any;
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
    const sideEffects = vi.fn();
    const editor = createPlateEditor();
    const { getByText, getByLabelText } = render(
      <Plate
        editor={editor as never}
        initialValue={
          [
            { type: 'a', id: 'asdf', url: '', children: [{ text: '' }] },
          ] as MyElement[]
        }
        onChange={noop}
      >
        <PlateContent
          renderElement={(props: unknown) => (
            <Link
              {...(props as ComponentProps<PlateComponent>)}
              sideEffects={sideEffects}
            />
          )}
        />
      </Plate>
    );

    await userEvent.type(getByLabelText('value'), 'test');
    await userEvent.click(getByText('mutate'));

    expect(editor).toHaveProperty('children.0.url', 'test');
    expect(sideEffects).toHaveBeenCalledTimes(1);
  });
});

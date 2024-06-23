import { it, expect, beforeEach } from 'vitest';
import { ELEMENT_H1 } from '@decipad/editor-types';
import { findDomNodePath } from '@decipad/editor-utils';
import { noop } from '@decipad/utils';
import { render, waitFor } from '@testing-library/react';
import type { PlateEditor, PlateProps } from '@udecode/plate-common';
import {
  createPlateEditor,
  createPlugins,
  deleteText,
  insertText,
  Plate,
  PlateContent,
  select,
} from '@udecode/plate-common';
import { Title } from './Title';
import { createHeadingPlugin } from '@udecode/plate-heading';

let plateProps: Omit<PlateProps, 'children'>;
let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins(
    [createHeadingPlugin({ options: { levels: 1 } })],
    {
      components: {
        [ELEMENT_H1]: Title,
      },
    }
  );
  plateProps = {
    initialValue: [{ type: ELEMENT_H1, children: [{ text: 'text' }] }],
    plugins,
  };
  editor = createPlateEditor({ plugins });
});
it('shows a placeholder only when empty', async () => {
  const { getByText } = render(
    <Plate {...plateProps} editor={editor}>
      <PlateContent scrollSelectionIntoView={noop} />
    </Plate>
  );
  const h1Element = getByText('text').closest('h1');

  insertText(editor, 'text2', {
    at: findDomNodePath(editor, getByText('text')),
  });
  select(editor, {
    path: findDomNodePath(editor, getByText('text'))!,
    offset: 0,
  });
  await waitFor(() => expect(h1Element).toHaveTextContent('text2'));
  expect(h1Element).not.toHaveAttribute('aria-placeholder');

  deleteText(editor, {
    at: findDomNodePath(editor, getByText('text2')),
    unit: 'word',
  });
  await waitFor(() => expect(h1Element).toHaveTextContent(/^$/));
  expect(h1Element).toHaveAttribute(
    'aria-placeholder',
    expect.stringMatching(/My notebook/i)
  );
});

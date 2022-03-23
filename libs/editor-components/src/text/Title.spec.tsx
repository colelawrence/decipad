import { ELEMENT_H1 } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render, waitFor } from '@testing-library/react';
import {
  createHeadingPlugin,
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlateProps,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { findDomNodePath } from '@decipad/slate-react-utils';
import { Title } from './Title';

let plateProps: PlateProps;
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
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [{ type: ELEMENT_H1, children: [{ text: 'text' }] }],
    plugins,
  };
  editor = createPlateEditor(plateProps);
});
it('shows a placeholder only when empty', async () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />);
  const h1Element = getByText('text').closest('h1');

  Transforms.insertText(editor, 'text2', {
    at: findDomNodePath(editor, getByText('text')),
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('text')),
    offset: 0,
  });
  await waitFor(() => expect(h1Element).toHaveTextContent('text2'));
  expect(h1Element).not.toHaveAttribute('aria-placeholder');

  Transforms.delete(editor, {
    at: findDomNodePath(editor, getByText('text2')),
    unit: 'word',
  });
  await waitFor(() => expect(h1Element).toHaveTextContent(/^$/));
  expect(h1Element).toHaveAttribute(
    'aria-placeholder',
    expect.stringMatching(/title/i)
  );
});

it('autofocuses on first render', async () => {
  const { getByRole } = render(<Plate {...plateProps} editor={editor} />);

  expect(document.activeElement).toBe(getByRole('textbox'));
  expect(editor.selection!.focus.path).toEqual([0, 0]);
});

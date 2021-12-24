import { render, waitFor } from '@testing-library/react';
import {
  createEditorPlugins,
  Plate,
  createHeadingPlugin,
  ELEMENT_H1,
  PlatePluginComponent,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { Title } from './Title';
import { findDomNodePath } from '../../utils/slateReact';

it('shows a placeholder only when empty', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_H1, children: [{ text: 'text' }] }]}
      plugins={[createHeadingPlugin({ levels: 1 })]}
      components={{ [ELEMENT_H1]: Title as PlatePluginComponent }}
    />
  );
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

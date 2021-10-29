import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
  Plate,
  createEditorPlugins,
} from '@udecode/plate';
import { render, waitFor } from '@testing-library/react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Paragraph } from './Paragraph';

it('shows a placeholder only when empty', async () => {
  const editor = createEditorPlugins();
  const { getByText, queryByText } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph }}
    />
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');

  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');

  Transforms.delete(editor, {
    at: ReactEditor.findPath(
      editor,
      ReactEditor.toSlateNode(editor, textElement)
    ),
    unit: 'word',
  });
  await waitFor(() => {
    expect(queryByText('text')).toBeNull();
  });
  expect(paragraphElement).toHaveAttribute(
    'aria-placeholder',
    expect.stringMatching(/type/i)
  );
});

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

it('shows a placeholder when empty and selected', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph }}
    />
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');

  Transforms.delete(editor, {
    at: ReactEditor.findPath(
      editor,
      ReactEditor.toSlateNode(editor, textElement)
    ),
    unit: 'word',
  });
  Transforms.select(editor, {
    path: ReactEditor.findPath(
      editor,
      ReactEditor.toSlateNode(editor, textElement)
    ),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).toHaveAttribute(
    'aria-placeholder',
    expect.stringMatching(/type/i)
  );
});

it('does not show a placeholder when not selected', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph }}
    />
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');
  const otherTextElement = getByText('other');

  Transforms.delete(editor, {
    at: ReactEditor.findPath(
      editor,
      ReactEditor.toSlateNode(editor, textElement)
    ),
    unit: 'word',
  });
  Transforms.select(editor, {
    path: ReactEditor.findPath(
      editor,
      ReactEditor.toSlateNode(editor, otherTextElement)
    ),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

import {
  createParagraphPlugin,
  Plate,
  createEditorPlugins,
  PlatePluginComponent,
} from '@udecode/plate';
import { render, waitFor } from '@testing-library/react';
import { Transforms } from 'slate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Paragraph } from './Paragraph';
import { findDomNodePath } from '../../utils/slateReact';
import { ELEMENT_PARAGRAPH } from '../../elements';

const wrapper: React.FC = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

it('shows a placeholder when empty and selected', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph as PlatePluginComponent }}
    />,
    { wrapper }
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');

  Transforms.delete(editor, {
    at: findDomNodePath(editor, textElement),
    unit: 'word',
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, textElement),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).toHaveAttribute(
    'aria-placeholder',
    expect.stringMatching(/type/i)
  );
});

it('does not show a placeholder when not empty', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph as PlatePluginComponent }}
    />,
    { wrapper }
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');

  Transforms.insertText(editor, 'text2', {
    at: findDomNodePath(editor, textElement),
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, textElement),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent('text2'));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
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
      components={{ [ELEMENT_PARAGRAPH]: Paragraph as PlatePluginComponent }}
    />,
    { wrapper }
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');
  const otherTextElement = getByText('other');

  Transforms.delete(editor, {
    at: findDomNodePath(editor, textElement),
    unit: 'word',
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, otherTextElement),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

it('does not show a placeholder when selecting more than the paragraph', async () => {
  const editor = createEditorPlugins();
  const { getByText } = render(
    <Plate
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph as PlatePluginComponent }}
    />,
    { wrapper }
  );
  const textElement = getByText('text');
  const paragraphElement = textElement.closest('p');
  const otherTextElement = getByText('other');

  Transforms.delete(editor, {
    at: findDomNodePath(editor, textElement),
    unit: 'word',
  });
  Transforms.select(editor, {
    anchor: {
      path: findDomNodePath(editor, textElement),
      offset: 0,
    },
    focus: {
      path: findDomNodePath(editor, otherTextElement),
      offset: 0,
    },
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

it('does not show a placeholder when in readOnly mode', async () => {
  const editor = createEditorPlugins();
  const { container } = render(
    <Plate
      editor={editor}
      initialValue={[{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }]}
      plugins={[createParagraphPlugin()]}
      components={{ [ELEMENT_PARAGRAPH]: Paragraph as PlatePluginComponent }}
      editableProps={{
        readOnly: true,
      }}
    />,
    { wrapper }
  );
  const paragraphElement = container.querySelector('p')!;

  Transforms.select(editor, {
    path: findDomNodePath(editor, paragraphElement),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

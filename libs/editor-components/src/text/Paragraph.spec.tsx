import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { render, waitFor } from '@testing-library/react';
import {
  createParagraphPlugin,
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlateProps,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Transforms } from 'slate';
import { findDomNodePath } from '@decipad/slate-react-utils';
import { Paragraph } from './Paragraph';

const wrapper: React.FC = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

let plateProps: PlateProps;
let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([createParagraphPlugin()], {
    components: {
      [ELEMENT_PARAGRAPH]: Paragraph,
    },
  });
  plateProps = {
    initialValue: [{ type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }],
    plugins,
  };
  editor = createPlateEditor(plateProps);
});

it('shows a placeholder when empty and selected', async () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
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
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
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
  const { getByText } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
    />,
    {
      wrapper,
    }
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
  const { getByText } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
    />,
    {
      wrapper,
    }
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
  plateProps.editableProps = {
    readOnly: true,
  };
  editor = createPlateEditor(plateProps);
  const { editor: _editor, ...restProps } = plateProps;
  const { container } = render(<Plate {...restProps} editor={editor} />, {
    wrapper,
  });
  const paragraphElement = container.querySelector('p')!;

  Transforms.select(editor, {
    path: findDomNodePath(editor, paragraphElement),
    offset: 0,
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent('text'));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

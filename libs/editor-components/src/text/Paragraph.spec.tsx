import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { act, render, waitFor } from '@testing-library/react';
import {
  createParagraphPlugin,
  createPlateEditor,
  createPlugins,
  deleteText,
  insertText,
  Plate,
  PlateEditor,
  PlateProps,
  select,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { findDomNodePath } from '@decipad/editor-utils';
import { PropsWithChildren } from 'react';
import { timeout } from '@decipad/utils';
import { Paragraph } from './Paragraph';

const wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
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
  editor = createPlateEditor({ plugins });
});

it('shows a placeholder when notebook empty and not selected', async () => {
  const renderedObject = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_H1, children: [{ text: 'title' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
      ]}
    />,
    {
      wrapper,
    }
  );
  const paragraphElement =
    renderedObject.getAllByTestId('paragraph-wrapper')[0];
  await waitFor(() => expect(paragraphElement).toHaveTextContent('Type'));
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('shows a placeholder when empty and selected', async () => {
  const { getByText, getAllByTestId } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );
  const textElement = getByText('text');
  const paragraphElement = getAllByTestId('paragraph-wrapper')[0];

  await act(async () => {
    deleteText(editor, {
      at: findDomNodePath(editor, textElement),
      unit: 'word',
    });
    select(editor, {
      path: findDomNodePath(editor, textElement)!,
      offset: 0,
    });
    await timeout(500);
  });

  await waitFor(() => expect(paragraphElement).toHaveTextContent('Type'));
});

it('does not show a placeholder when not empty', async () => {
  const { getByText, getAllByTestId } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );
  const textElement = getByText('text');
  const paragraphElement = getAllByTestId('paragraph-wrapper')[0];

  await act(async () => {
    insertText(editor, 'text2', {
      at: findDomNodePath(editor, textElement),
    });
    select(editor, {
      path: findDomNodePath(editor, textElement)!,
      offset: 0,
    });
    await timeout(500);
  });

  await waitFor(() => expect(paragraphElement).toHaveTextContent('text2'));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

it('does not show a placeholder when not selected', async () => {
  const { getByText, getAllByTestId } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_H1, children: [{ text: 'title' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
    />,
    {
      wrapper,
    }
  );
  const textElement = getByText('text');
  const paragraphElement = getAllByTestId('paragraph-wrapper')[0];
  const otherTextElement = getByText('other');

  await act(async () => {
    deleteText(editor, {
      at: findDomNodePath(editor, textElement),
      unit: 'word',
    });
    select(editor, {
      path: findDomNodePath(editor, otherTextElement)!,
      offset: 0,
    });
    await timeout(500);
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

it('does not show a placeholder when selecting more than the paragraph', async () => {
  const { getByText, getAllByTestId } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_H1, children: [{ text: 'title' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'other' }] },
      ]}
    />,
    {
      wrapper,
    }
  );
  const textElement = getByText('text');
  const paragraphElement = getAllByTestId('paragraph-wrapper')[0];
  const otherTextElement = getByText('other');

  await act(async () => {
    deleteText(editor, {
      at: findDomNodePath(editor, textElement),
      unit: 'word',
    });
    select(editor, {
      anchor: {
        path: findDomNodePath(editor, textElement)!,
        offset: 0,
      },
      focus: {
        path: findDomNodePath(editor, otherTextElement)!,
        offset: 0,
      },
    });
    await timeout(500);
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent(/^$/));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

it('does not show a placeholder when in readOnly mode', async () => {
  plateProps.readOnly = true;
  editor = createPlateEditor({ plugins: plateProps.plugins });
  const { editor: _editor, ...restProps } = plateProps;
  const { getByText, getByTestId } = render(
    <Plate {...restProps} editor={editor} />,
    {
      wrapper,
    }
  );
  const textElement = getByText('text');
  const paragraphElement = getByTestId('paragraph-wrapper');

  await act(async () => {
    select(editor, {
      path: findDomNodePath(editor, textElement)!,
      offset: 0,
    });
    await timeout(500);
  });
  await waitFor(() => expect(paragraphElement).toHaveTextContent('text'));
  expect(paragraphElement).not.toHaveAttribute('aria-placeholder');
});

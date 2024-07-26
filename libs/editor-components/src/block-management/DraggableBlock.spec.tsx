import { describe, it, expect, beforeEach } from 'vitest';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { noop, thro } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlateEditor, PlateProps } from '@udecode/plate-common';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateContent,
} from '@udecode/plate-common';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { Paragraph } from '../text/Paragraph';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  EditorReadOnlyContext,
  AnnotationsProvider,
} from '@decipad/react-contexts';
import { BrowserRouter } from 'react-router-dom';

let editor: PlateEditor;
let plateProps: Omit<PlateProps, 'children'>;
let wrapper: React.FC<PropsWithChildren<unknown>>;
beforeEach(() => {
  const plugins = createPlugins([
    createParagraphPlugin({
      component: Paragraph,
    }),
  ]);

  plateProps = {
    initialValue: [
      {
        type: ELEMENT_PARAGRAPH,
        id: '0',
        children: [{ text: 'my-paragraph' }],
      },
    ],
    plugins,
  };

  editor = createPlateEditor({ plugins });

  wrapper = ({ children }) => (
    <AnnotationsProvider
      value={{
        annotations: [],
        setAnnotations: () => {},
        scenarioId: null,
        expandedBlockId: null,
        handleExpandedBlockId: () => {},
        permission: 'WRITE',
        aliasId: null,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>{children}</BrowserRouter>
      </DndProvider>
    </AnnotationsProvider>
  );
});

it('renders the paragraph', async () => {
  const { getByText } = render(
    <Plate {...plateProps} editor={editor}>
      <PlateContent scrollSelectionIntoView={noop} />
    </Plate>,
    {
      wrapper,
    }
  );
  expect(getByText('my-paragraph')).toBeVisible();
});

it('renders a drag handle', async () => {
  const { getAllByTitle } = render(
    <Plate {...plateProps} editor={editor}>
      <PlateContent scrollSelectionIntoView={noop} />
    </Plate>,
    {
      wrapper,
    }
  );
  expect(getAllByTitle(/drag/i)[0]).toBeInTheDocument();
});

describe('when editor is in readOnly mode', () => {
  it('does not render the drag handle', async () => {
    const props = {
      ...plateProps,
      readOnly: true,
    };
    const { queryByTitle } = render(
      <EditorReadOnlyContext.Provider
        value={{
          readOnly: true,
          lockWriting: () =>
            thro(new Error('not implemented, see: useWriteLock')),
        }}
      >
        <Plate {...props} editor={editor}>
          <PlateContent scrollSelectionIntoView={noop} />
        </Plate>
      </EditorReadOnlyContext.Provider>,
      {
        wrapper,
      }
    );
    expect(queryByTitle(/drag/i)).not.toBeInTheDocument();
  });
});

it('can delete the block', async () => {
  const { getByTitle, getAllByTitle } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
        { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
      ]}
    >
      <PlateContent />
    </Plate>,
    {
      wrapper,
    }
  );
  const dragHandles = getAllByTitle(/drag/i);
  const [, secondDragHandle] = dragHandles;
  await userEvent.click(secondDragHandle);

  expect(editor.children).toHaveChildrenText(['first', 'second']);
  await userEvent.click(getByTitle(/trash/i));
  expect(editor.children).toHaveChildrenText(['first']);
});

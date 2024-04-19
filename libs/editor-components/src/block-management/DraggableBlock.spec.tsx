import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { noop, thro } from '@decipad/utils';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate-common';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateContent,
} from '@udecode/plate-common';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  EditorReadOnlyContext,
  AnnotationsProvider,
} from '@decipad/react-contexts';
import { DraggableBlock } from './DraggableBlock';
import { BrowserRouter } from 'react-router-dom';

const DraggableParagraph: PlateComponent = ({ element, children }) => (
  <DraggableBlock blockKind="paragraph" element={element!}>
    <div data-testid="draggable">{children}</div>
  </DraggableBlock>
);

const DraggableParagraphPlugin: PlatePlugin = {
  key: ELEMENT_PARAGRAPH,
  isElement: true,
  type: ELEMENT_PARAGRAPH,
  component: DraggableParagraph,
};

let editor: PlateEditor;
let plateProps: Omit<PlateProps, 'children'>;
let wrapper: React.FC<PropsWithChildren<unknown>>;
beforeEach(() => {
  const plugins = createPlugins([DraggableParagraphPlugin]);
  plateProps = {
    initialValue: [
      { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'text' }] },
    ],
    plugins,
  };
  editor = createPlateEditor({ plugins });
  wrapper = ({ children }) => (
    <AnnotationsProvider
      value={{
        annotations: [],
        setAnnotations: () => {},
        articleRef: { current: null },
        scenarioId: null,
        expandedBlockId: null,
        setExpandedBlockId: () => {},
        canDeleteComments: true,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>{children}</BrowserRouter>
      </DndProvider>
    </AnnotationsProvider>
  );
});

it('renders the main block', async () => {
  const { getByTestId } = render(
    <Plate {...plateProps} editor={editor}>
      <PlateContent scrollSelectionIntoView={noop} />
    </Plate>,
    {
      wrapper,
    }
  );
  expect(getByTestId('draggable')).toBeVisible();
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const originalCaretPositionFromPoint: typeof document.caretPositionFromPoint =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  document.caretPositionFromPoint;
afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  document.caretPositionFromPoint = originalCaretPositionFromPoint;
});
it('can move the block', async () => {
  plateProps.initialValue = [
    { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
    { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
  ];
  const { getByText, getAllByTitle } = render(
    <Plate {...plateProps} editor={editor}>
      <PlateContent scrollSelectionIntoView={noop} />
    </Plate>,
    {
      wrapper,
    }
  );
  const dragHandles = getAllByTitle(/drag/i);
  expect(dragHandles).toHaveLength(2);
  const [firstDragHandle] = dragHandles;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  document.caretPositionFromPoint = (x, y) => {
    if (x !== 100 || y !== 100)
      throw new Error('Do not know position for this point');
    return {
      offsetNode: getByText('second'),
      offset: 0,
      getClientRect: () => null,
    };
  };
  await act(async () => {
    fireEvent.dragStart(firstDragHandle);
    fireEvent.dragEnter(getByText('second'), { clientX: 100, clientY: 100 });
    fireEvent.dragOver(getByText('second'), { clientX: 100, clientY: 100 });
  });
  expect(editor.children).toHaveChildrenText(['first', 'second']);

  await act(async () => {
    fireEvent.drop(getByText('second'), {
      clientX: 100,
      clientY: 100,
    });
  });
  expect(editor.children).toHaveChildrenText(['second', 'first']);
});

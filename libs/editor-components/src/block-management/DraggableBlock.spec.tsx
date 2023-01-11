import { ELEMENT_PARAGRAPH, PlateComponent } from '@decipad/editor-types';
import { noop, thro } from '@decipad/utils';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate';
import { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditorReadOnlyContext } from '@decipad/react-contexts';
import { DraggableBlock } from './DraggableBlock';

const DraggableParagraph: PlateComponent = ({ element, children }) => (
  <DraggableBlock blockKind="paragraph" element={element!}>
    <p>{children}</p>
  </DraggableBlock>
);

const DraggableParagraphPlugin: PlatePlugin = {
  key: ELEMENT_PARAGRAPH,
  isElement: true,
  type: ELEMENT_PARAGRAPH,
  component: DraggableParagraph,
};

let editor: PlateEditor;
let plateProps: PlateProps;
let wrapper: React.FC<PropsWithChildren<unknown>>;
beforeEach(() => {
  const plugins = createPlugins([DraggableParagraphPlugin]);
  plateProps = {
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'text' }] },
    ],
    plugins,
  };
  editor = createPlateEditor({ plugins });
  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the main block', async () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
  expect(getByText('text').closest('p')).toBeVisible();
});

it('renders a drag handle', async () => {
  const { getAllByTitle } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
  expect(getAllByTitle(/drag/i)[0]).toBeInTheDocument();
});

describe('when editor is in readOnly mode', () => {
  it('does not render the drag handle', async () => {
    const props = {
      ...plateProps,
      readOnly: true,
      editableProps: { ...plateProps.editableProps },
    };
    const { queryByTitle } = render(
      <EditorReadOnlyContext.Provider
        value={{
          readOnly: true,
          lockWriting: () =>
            thro(new Error('not implemented, see: useWriteLock')),
        }}
      >
        <Plate {...props} editor={editor} />
      </EditorReadOnlyContext.Provider>,
      {
        wrapper,
      }
    );
    expect(queryByTitle(/drag/i)).not.toBeInTheDocument();
  });
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('can delete the block', async () => {
  const { getByTitle, getAllByTitle, debug } = render(
    <Plate
      {...plateProps}
      editor={editor}
      initialValue={[
        { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
        { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
      ]}
    />,
    {
      wrapper,
    }
  );
  const dragHandles = getAllByTitle(/drag/i);
  const [, , , secondDragHandle] = dragHandles;
  await userEvent.click(secondDragHandle);
  debug();

  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'first' }] }),
    expect.objectContaining({ children: [{ text: 'second' }] }),
  ]);
  await userEvent.click(getByTitle(/delete/i));
  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'first' }] }),
  ]);
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
it('can move the block', () => {
  plateProps.initialValue = [
    { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
    { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
  ];
  const { getByText, getAllByTitle } = render(
    <Plate {...plateProps} editor={editor} />,
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

  fireEvent.dragStart(firstDragHandle);
  fireEvent.dragEnter(getByText('second'), { clientX: 100, clientY: 100 });
  fireEvent.dragOver(getByText('second'), { clientX: 100, clientY: 100 });

  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'first' }] }),
    expect.objectContaining({ children: [{ text: 'second' }] }),
  ]);
  fireEvent.drop(getByText('second'), {
    clientX: 100,
    clientY: 100,
  });
  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'second' }] }),
    expect.objectContaining({ children: [{ text: 'first' }] }),
  ]);
});

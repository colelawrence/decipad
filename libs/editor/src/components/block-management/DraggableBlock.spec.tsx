import { types } from '@decipad/editor-config';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createEditorPlugins,
  createListPlugin,
  createParagraphPlugin,
  Plate,
  PlatePluginComponent,
  PlateProps,
  SPEditor,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableBlock } from './DraggableBlock';

const DraggableParagraph: types.PlateComponent = ({ element, children }) => (
  <DraggableBlock blockKind="paragraph" element={element!}>
    <p>{children}</p>
  </DraggableBlock>
);

let editor: SPEditor;
let plateProps: PlateProps;
let wrapper: React.FC;
beforeEach(() => {
  editor = createEditorPlugins();
  plateProps = {
    editor,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'text' }] },
    ],
    plugins: [createParagraphPlugin()],
    components: {
      [ELEMENT_PARAGRAPH]: DraggableParagraph as PlatePluginComponent,
    },
  };
  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the main block', async () => {
  const { getByText } = render(<Plate {...plateProps} />, { wrapper });
  expect(getByText('text').closest('p')).toBeVisible();
});

it('renders a drag handle', async () => {
  const { getByTitle } = render(<Plate {...plateProps} />, { wrapper });
  expect(getByTitle(/drag/i)).toBeInTheDocument();
});

describe('when editor is in readOnly mode', () => {
  it('does not render the drag handle', async () => {
    const props = {
      ...plateProps,
      editableProps: { ...plateProps.editableProps, readOnly: true },
    };
    const { queryByTitle } = render(<Plate {...props} />, {
      wrapper,
    });
    expect(queryByTitle(/drag/i)).not.toBeInTheDocument();
  });
});

it('can delete the block', () => {
  plateProps.initialValue = [
    { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
    { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
  ];
  const { getByTitle, getAllByTitle } = render(<Plate {...plateProps} />, {
    wrapper,
  });
  const dragHandles = getAllByTitle(/drag/i);
  const [, secondDragHandle] = dragHandles;
  userEvent.click(secondDragHandle);

  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'first' }] }),
    expect.objectContaining({ children: [{ text: 'second' }] }),
  ]);
  userEvent.click(getByTitle(/delete/i));
  expect(editor.children).toEqual([
    expect.objectContaining({ children: [{ text: 'first' }] }),
  ]);
});

const originalCaretPositionFromPoint: typeof document.caretPositionFromPoint =
  document.caretPositionFromPoint;
afterEach(() => {
  document.caretPositionFromPoint = originalCaretPositionFromPoint;
});
it('can move the block', () => {
  plateProps.initialValue = [
    { type: ELEMENT_PARAGRAPH, id: '0', children: [{ text: 'first' }] },
    { type: ELEMENT_PARAGRAPH, id: '1', children: [{ text: 'second' }] },
  ];
  const { getByText, getAllByTitle } = render(<Plate {...plateProps} />, {
    wrapper,
  });
  const dragHandles = getAllByTitle(/drag/i);
  expect(dragHandles).toHaveLength(2);
  const [firstDragHandle] = dragHandles;

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

it('does not render a drag handle when nested in another DraggableBlock', async () => {
  plateProps.plugins = [createListPlugin()];
  const DraggableUnorderedList: types.PlateComponent = ({
    element,
    children,
  }) => (
    <DraggableBlock blockKind="list" element={element!}>
      {children}
    </DraggableBlock>
  );
  plateProps.components = {
    [ELEMENT_UL]: DraggableUnorderedList as PlatePluginComponent,
  };
  plateProps.initialValue = [
    {
      type: ELEMENT_UL,
      id: '0',
      children: [
        {
          type: ELEMENT_LI,
          children: [{ type: ELEMENT_LIC, children: [{ text: '1' }] }],
        },
        {
          type: ELEMENT_UL,
          children: [
            {
              type: ELEMENT_LI,
              children: [{ type: ELEMENT_LIC, children: [{ text: '2' }] }],
            },
          ],
        },
      ],
    },
  ];
  const { getAllByTitle } = render(<Plate {...plateProps} />, { wrapper });
  expect(getAllByTitle(/drag/i)).toHaveLength(1);
});

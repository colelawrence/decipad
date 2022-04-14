import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  PlateComponent,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createListPlugin,
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlatePlugin,
  PlatePluginComponent,
  PlateProps,
} from '@udecode/plate';
import { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  editor = createPlateEditor(plateProps);
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
  const { getByTitle } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
  expect(getByTitle(/drag/i)).toBeInTheDocument();
});

describe('when editor is in readOnly mode', () => {
  it('does not render the drag handle', async () => {
    const props = {
      ...plateProps,
      editableProps: { ...plateProps.editableProps, readOnly: true },
    };
    const { queryByTitle } = render(<Plate {...props} editor={editor} />, {
      wrapper,
    });
    expect(queryByTitle(/drag/i)).not.toBeInTheDocument();
  });
});

it('can delete the block', () => {
  const { getByTitle, getAllByTitle } = render(
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

it('does not render a drag handle when nested in another DraggableBlock', async () => {
  plateProps.plugins = [createListPlugin()];
  const DraggableUnorderedList: PlateComponent = ({ element, children }) => (
    <DraggableBlock blockKind="list" element={element!}>
      {children}
    </DraggableBlock>
  );
  plateProps.plugins = [
    {
      key: ELEMENT_UL,
      type: ELEMENT_UL,
      isElement: true,
      component: DraggableUnorderedList as PlatePluginComponent,
    },
  ];
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
  const { editor: _editor, ...restPlateProps } = plateProps;
  editor = createPlateEditor(restPlateProps);
  const { getAllByTitle } = render(
    <Plate {...restPlateProps} editor={editor} />,
    {
      wrapper,
    }
  );
  expect(getAllByTitle(/drag/i)).toHaveLength(1);
});

import {
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createPlateEditor,
  createPlugins,
  getText,
  Plate,
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VariableDef } from './VariableDef';

let plateProps: PlateProps;
let editor: PlateEditor;
let wrapper: React.FC<
  React.PropsWithChildren<React.PropsWithChildren<unknown>>
>;
beforeEach(() => {
  const inputPlugin: PlatePlugin = {
    key: ELEMENT_VARIABLE_DEF,
    isElement: true,
    component: VariableDef,
  };
  const plugins = createPlugins([inputPlugin]);
  plateProps = {
    plugins,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      {
        type: ELEMENT_VARIABLE_DEF,
        children: [
          {
            type: ELEMENT_CAPTION,
            children: [{ text: 'var' }],
          },
          {
            type: ELEMENT_EXPRESSION,
            children: [{ text: '10' }],
          },
        ],
      },
    ],
  };
  editor = createPlateEditor(plateProps);

  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the element properties', () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });

  expect(getByText('var')).toBeVisible();
  expect(getByText('10')).toBeVisible();
});

it('converts element to code block', async () => {
  const { getByTitle, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  await userEvent.click(getByTitle(/ellipsis/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.click(await findByText(/turn.+code/i), {
    pointerEventsCheck: 0,
  });

  expect(editor.children[0].type).toBe(ELEMENT_CODE_LINE);
  expect(getText(editor, [0])).toMatchInlineSnapshot(`"var = 10"`);
});

it('deletes element', async () => {
  const { getByTitle, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  await userEvent.click(getByTitle(/ellipsis/i, undefined, {}), {
    pointerEventsCheck: 0,
  });
  await userEvent.click(await findByText(/delete/i), {
    pointerEventsCheck: 0,
  });

  expect(editor.children).toHaveLength(0);
});

it('adds a new input element', async () => {
  const { getByTitle } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });

  await userEvent.click(getByTitle(/add/i), {
    pointerEventsCheck: 0,
  });

  expect(editor.children[0].type).toBe(ELEMENT_COLUMNS);
  expect(editor.children[0].children).toHaveLength(2);
  expect(editor.children[0].children[0].type).toBe(ELEMENT_VARIABLE_DEF);
  expect(editor.children[0].children[1].type).toBe(ELEMENT_VARIABLE_DEF);
});

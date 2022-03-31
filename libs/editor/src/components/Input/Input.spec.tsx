import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_INPUT,
  ELEMENT_COLUMNS,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { fireEvent, render } from '@testing-library/react';
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
import { Input } from './Input';

let plateProps: PlateProps;
let editor: PlateEditor;
let wrapper: React.FC;
beforeEach(() => {
  const inputPlugin: PlatePlugin = {
    key: ELEMENT_INPUT,
    isVoid: true,
    isElement: true,
    component: Input,
  };
  const plugins = createPlugins([inputPlugin]);
  plateProps = {
    plugins,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      {
        type: ELEMENT_INPUT,
        variableName: 'var',
        value: '10',
        children: [{ text: '' }],
      },
    ],
  };
  editor = createPlateEditor(plateProps);

  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the element properties', () => {
  const { getByDisplayValue, getByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  expect(getByDisplayValue('var')).toBeVisible();
  expect(getByText('10')).toBeVisible();
});

it('updates the element name when edited', () => {
  const { getByDisplayValue } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  const input = getByDisplayValue('var');
  userEvent.type(input, 'iable');
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(editor.children[0].variableName).toBe('variable');
});

it('converts element to code block', async () => {
  const { getByTitle, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  userEvent.click(getByTitle(/ellipsis/i));
  userEvent.click(await findByText(/turn.+code/i));

  expect(editor.children[0].type).toBe(ELEMENT_CODE_BLOCK);
  expect(editor.children[0].children[0].type).toBe(ELEMENT_CODE_LINE);
  expect(getText(editor, [0])).toMatchInlineSnapshot(`"var = 10"`);
});

it('deletes element', async () => {
  const { getByTitle, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  userEvent.click(getByTitle(/ellipsis/i));
  userEvent.click(await findByText(/delete/i));

  expect(editor.children).toHaveLength(0);
});

it('adds a new input element', async () => {
  const { getByTitle } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });

  userEvent.click(getByTitle(/add/i));

  expect(editor.children[0].type).toBe(ELEMENT_COLUMNS);
  expect(editor.children[0].children).toHaveLength(2);
  expect(editor.children[0].children[0].type).toBe(ELEMENT_INPUT);
  expect(editor.children[0].children[1].type).toBe(ELEMENT_INPUT);
});

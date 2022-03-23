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
  createCodeBlockPlugin,
  createEditorPlugins,
  getText,
  Plate,
  PlatePluginComponent,
  SPEditor,
  TElement,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactEditor } from 'slate-react';
import { CodeBlock, CodeLine } from '..';
import { useLanguagePlugin } from '../../plugins/Language/useLanguagePlugin';
import { Input } from './Input';

const FakePlate = ({ editor }: { editor: SPEditor & ReactEditor }) => {
  const { languagePlugin } = useLanguagePlugin();
  return (
    <Plate
      editor={editor}
      editableProps={{ scrollSelectionIntoView: noop }}
      initialValue={[
        {
          type: ELEMENT_INPUT,
          variableName: 'var',
          value: '10',
          children: [{ text: '' }],
        },
      ]}
      plugins={[createCodeBlockPlugin(), languagePlugin]}
      components={{
        [ELEMENT_INPUT]: Input as PlatePluginComponent,
        [ELEMENT_CODE_BLOCK]: CodeBlock as PlatePluginComponent,
        [ELEMENT_CODE_LINE]: CodeLine as PlatePluginComponent,
      }}
    />
  );
};

let editor: SPEditor & ReactEditor;
let wrapper: React.FC;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.insertNode({
    type: ELEMENT_INPUT,
    variableName: 'var',
    value: '10',
    children: [{ text: '' }],
  } as TElement);

  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the element properties', () => {
  const { getByDisplayValue } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  expect(getByDisplayValue('var')).toBeVisible();
  expect(getByDisplayValue('10')).toBeVisible();
});

it('updates the element name when edited', () => {
  const { getByDisplayValue } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  const input = getByDisplayValue('var');
  userEvent.type(input, 'iable');
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(editor.children[0].variableName).toBe('variable');
});

it('updates the element value when edited', () => {
  const { getByDisplayValue } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  const input = getByDisplayValue('10');
  userEvent.type(input, '0');
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(editor.children[0].value).toBe('100');
});

it('converts element to code block', async () => {
  const { getByTitle, findByText } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  userEvent.click(getByTitle(/ellipsis/i));
  userEvent.click(await findByText(/turn.+code/i));

  expect(editor.children[0].type).toBe(ELEMENT_CODE_BLOCK);
  expect(editor.children[0].children[0].type).toBe(ELEMENT_CODE_LINE);
  expect(getText(editor, [0])).toMatchInlineSnapshot(`"var = 10"`);
});

it('deletes element', async () => {
  const { getByTitle, findByText } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  userEvent.click(getByTitle(/ellipsis/i));
  userEvent.click(await findByText(/delete/i));

  expect(editor.children).toHaveLength(0);
});

it('adds a new input element', async () => {
  const { getByTitle } = render(<FakePlate editor={editor} />, {
    wrapper,
  });

  userEvent.click(getByTitle(/add/i));

  expect(editor.children[0].type).toBe(ELEMENT_COLUMNS);
  expect(editor.children[0].children).toHaveLength(2);
  expect(editor.children[0].children[0].type).toBe(ELEMENT_INPUT);
  expect(editor.children[0].children[1].type).toBe(ELEMENT_INPUT);
});

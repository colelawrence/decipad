import { ClientEventContextType } from '@decipad/client-events';
import {
  createTPlateEditor,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_LINE,
  ELEMENT_VARIABLE_DEF,
  VariableDefinitionElement,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { TEditor } from '@udecode/plate';
import { ChecklistEvent } from 'libs/client-events/src/checklist';
import { nanoid } from 'nanoid';
import { createUserEventPlugin } from './createUserEventPlugin';

let editor: TEditor;
let mockClientEvent: ChecklistEvent | null;
const mockEvents: ClientEventContextType = jest.fn((event) => {
  // Casting is safe because plugin does not return anything except action events.
  mockClientEvent = event as ChecklistEvent;
  return Promise.resolve();
});

beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createUserEventPlugin(mockEvents)],
  });
  mockClientEvent = null;
  jest.clearAllMocks();
});

const pElement = () => ({
  id: nanoid(),
  type: ELEMENT_PARAGRAPH,
  children: [
    {
      text: '',
    },
  ],
});

const codeLine = () => ({
  id: nanoid(),
  type: ELEMENT_CODE_LINE,
  children: [
    {
      text: '',
    },
  ],
});

const inputWidget = (): VariableDefinitionElement => ({
  id: nanoid(),
  type: ELEMENT_VARIABLE_DEF,
  variant: 'expression',
  children: [
    {
      id: nanoid(),
      type: ELEMENT_CAPTION,
      icon: 'icon',
      color: 'color',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      id: nanoid(),
      type: ELEMENT_EXPRESSION,
      children: [
        {
          text: '',
        },
      ],
    },
  ],
});

it('emits an event on element creation', () => {
  insertNodes(editor, pElement(), {
    at: [0],
  });
  expect(mockEvents).toHaveBeenCalled();
});

it('returns the element type on creation', () => {
  insertNodes(editor, pElement(), {
    at: [0],
  });
  expect(mockClientEvent).not.toBeNull();
  expect(mockClientEvent?.type).toBe('checklist');

  expect(mockClientEvent!.props.element).toBe(ELEMENT_PARAGRAPH);
});

it('emits an event on element interaction and text on interaction', () => {
  insertNodes(editor, codeLine(), {
    at: [0],
  });
  editor.selection = {
    focus: {
      path: [0, 0],
      offset: 0,
    },
    anchor: {
      path: [0, 0],
      offset: 0,
    },
  };
  editor.insertText('hello world');

  expect(mockClientEvent?.type).toBe('checklist');
  expect(mockClientEvent!.props.element).toBe(ELEMENT_CODE_LINE);
});

it('returns parent and variant of widgets on interaction', () => {
  insertNodes(editor, inputWidget(), {
    at: [0],
  });
  editor.selection = {
    focus: {
      path: [0, 1, 0],
      offset: 0,
    },
    anchor: {
      path: [0, 1, 0],
      offset: 0,
    },
  };
  editor.insertText('123');

  expect(mockClientEvent?.type).toBe('checklist');
  expect(mockClientEvent?.props.element).toBe(ELEMENT_EXPRESSION);

  if (mockClientEvent?.props.interaction !== 'interaction') return;
  expect(mockClientEvent.props.parent).toBe(ELEMENT_VARIABLE_DEF);
  expect(mockClientEvent.props.variant).toBe('expression');
});

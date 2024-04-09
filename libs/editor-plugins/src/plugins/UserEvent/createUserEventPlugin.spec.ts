import type {
  ClientEventContextType,
  HandleClientEventArgs,
  SegmentEventArgs,
} from '@decipad/client-events';
import type { VariableDefinitionElement } from '@decipad/editor-types';
import {
  createMyPlateEditor,
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import type { TEditor } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { createUserEventPlugin } from './createUserEventPlugin';
import type {
  ChecklistEvent,
  ElementInteraction,
} from 'libs/client-events/src/checklist';

let editor: TEditor;
let mockClientEvent: HandleClientEventArgs | null;
const mockEvents: ClientEventContextType = jest.fn((event) => {
  // Casting is safe because plugin does not return anything except action events.
  mockClientEvent = event as HandleClientEventArgs;
  return Promise.resolve();
});

beforeEach(() => {
  editor = createMyPlateEditor({
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
  insertNodes(editor, [pElement()], {
    at: [0],
  });
  expect(mockEvents).toHaveBeenCalled();
});

it('returns the element type on creation', () => {
  insertNodes(editor, [pElement()], {
    at: [0],
  });
  expect(mockClientEvent).not.toBeNull();
  expect((mockClientEvent as SegmentEventArgs)?.segmentEvent?.type).toBe(
    'checklist'
  );

  expect(
    ((mockClientEvent as SegmentEventArgs)!.segmentEvent as ChecklistEvent)
      .props.element
  ).toBe(ELEMENT_PARAGRAPH);
});

it('emits an event on element interaction and text on interaction', () => {
  insertNodes(editor, [codeLine()], {
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

  expect((mockClientEvent as SegmentEventArgs)?.segmentEvent?.type).toBe(
    'checklist'
  );
  expect(
    ((mockClientEvent as SegmentEventArgs)?.segmentEvent as ChecklistEvent)
      ?.props.element
  ).toBe(ELEMENT_CODE_LINE);
});

it('returns parent and variant of widgets on interaction', () => {
  insertNodes(editor, [inputWidget()], {
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

  expect((mockClientEvent as SegmentEventArgs)?.segmentEvent?.type).toBe(
    'checklist'
  );
  expect(
    ((mockClientEvent as SegmentEventArgs)?.segmentEvent as ChecklistEvent)
      .props.element
  ).toBe(ELEMENT_EXPRESSION);

  if (
    ((mockClientEvent as SegmentEventArgs)?.segmentEvent as ChecklistEvent)
      ?.props.interaction !== 'interaction'
  )
    return;
  expect(
    (
      ((mockClientEvent as SegmentEventArgs).segmentEvent as ChecklistEvent)
        .props as ElementInteraction
    ).parent
  ).toBe(ELEMENT_VARIABLE_DEF);
  expect(
    (
      ((mockClientEvent as SegmentEventArgs).segmentEvent as ChecklistEvent)
        .props as ElementInteraction
    ).variant
  ).toBe('expression');
});

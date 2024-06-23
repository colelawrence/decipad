import { vi } from 'vitest';
import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { act, fireEvent, render } from '@testing-library/react';
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
import { AnnotationsProvider } from '@decipad/react-contexts';
import { DraggableBlock } from '@decipad/editor-components';
import { BrowserRouter } from 'react-router-dom';
import { createDndBlockPlugin } from './createDndBlockPlugin';
import type { DropLine } from './types';

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
  const plugins = createPlugins([
    DraggableParagraphPlugin,
    createDndBlockPlugin(),
  ]);
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
        handleExpandedBlockId: () => {},
        permission: 'WRITE',
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>{children}</BrowserRouter>
      </DndProvider>
    </AnnotationsProvider>
  );
});

// Return a drop line below the second block
vi.mock('./getDropLineForMonitor', () => ({
  getDropLineForMonitor: () =>
    ({
      type: 'horizontal',
      id: '1',
      path: [1],
      direction: 'after',
      mainAxis: 0,
      crossAxis: {
        start: 0,
        end: 0,
      },
      confineToCrossAxis: false,
    } satisfies DropLine),
}));

it('can move the block', async () => {
  const first = {
    type: ELEMENT_PARAGRAPH,
    id: '0',
    children: [{ text: 'first' }],
  };
  const second = {
    type: ELEMENT_PARAGRAPH,
    id: '1',
    children: [{ text: 'second' }],
  };

  plateProps.initialValue = [first, second];

  const { getAllByTitle } = render(
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

  await act(async () => {
    fireEvent.dragStart(firstDragHandle);
    fireEvent.dragEnter(document.body);
    fireEvent.dragOver(document.body);
  });

  expect(editor.children).toMatchObject([first, second]);

  await act(async () => {
    fireEvent.drop(document.body);
  });

  expect(editor.children).toMatchObject([second, first]);
});

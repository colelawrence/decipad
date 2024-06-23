import { describe, it, expect } from 'vitest';
import { CodeLine } from '@decipad/editor-components';
import type { CodeLineElement } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { AnnotationsProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { Plate, PlateContent } from '@udecode/plate-common';
import type { PropsWithChildren } from 'react';
import React, { createRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';

describe('Placeholders', () => {
  // @ts-ignore
  const dumbElement: CodeLineElement = {
    type: ELEMENT_CODE_LINE,
    children: [{ text: '' }],
  };
  const attributes = {
    'data-slate-node': 'element' as 'element',
    ref: createRef(),
  };

  it('should hide if there are content', () => {
    render(
      <TestProvider>
        <CodeLine element={dumbElement} attributes={attributes}>
          Some text inside
        </CodeLine>
      </TestProvider>
    );
    expect(screen.queryByText('Distance = 42 km')).toBeNull();
  });
});

const TestProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => (
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
      <BrowserRouter>
        <Plate>
          <PlateContent />
          {children}
        </Plate>
      </BrowserRouter>
    </DndProvider>
  </AnnotationsProvider>
);

import { render, screen } from '@testing-library/react';
import { Plate } from '@udecode/plate';
import { CodeLine } from '@decipad/editor-components';
import { CodeLineElement, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import React, { createRef, PropsWithChildren } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

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

  it('should render', () => {
    const { getByText } = render(
      <TestProvider>
        <CodeLine element={dumbElement} attributes={attributes} />
      </TestProvider>
    );
    expect(getByText((text) => text.startsWith('Distance = '))).toBeVisible();
  });

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
  <DndProvider backend={HTML5Backend}>
    <Plate>{children}</Plate>
  </DndProvider>
);

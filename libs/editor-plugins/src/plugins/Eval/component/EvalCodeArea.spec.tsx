import React, { createRef, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { render, waitFor } from '@testing-library/react';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { ELEMENT_EVAL, EvalElement } from '@decipad/editor-types';
import { Plate } from '@udecode/plate';
import { EvalCodeArea } from './EvalCodeArea';

describe('JS Eval', () => {
  describe('basic scenarios', () => {
    const dumbElement: EvalElement = {
      id: 'first-eval',
      result: '',
      type: ELEMENT_EVAL,
      children: [{ text: '' }],
    };

    const attributes = {
      'data-slate-node': 'element' as 'element',
      ref: createRef(),
    };

    it('should render', async () => {
      const { getByText, rerender } = render(
        <TestProvider>
          <EvalCodeArea element={dumbElement} attributes={attributes} />
        </TestProvider>
      );

      const updatedElement: EvalElement = {
        ...dumbElement,
        // eslint-disable-next-line no-template-curly-in-string
        children: [{ text: '`testVariable = ${2 + 2}`' }],
      };

      rerender(
        <TestProvider>
          <EvalCodeArea element={updatedElement} attributes={attributes}>
            testVariable
          </EvalCodeArea>
        </TestProvider>
      );

      await waitFor(() => {
        expect(getByText('testVariable')).toBeVisible();
      });
    });
  });
});

const TestProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <ComputerContextProvider>
    <DndProvider backend={HTML5Backend}>
      <Plate>{children}</Plate>
    </DndProvider>
  </ComputerContextProvider>
);

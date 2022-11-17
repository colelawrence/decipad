import { ELEMENT_PLOT, PlotElement } from '@decipad/editor-types';
import { NotebookResults, SerializedType } from '@decipad/computer';
import {
  TestResultsProvider,
  ComputerContextProvider,
} from '@decipad/react-contexts';
import { render } from '@testing-library/react';
import { Plate } from '@udecode/plate';
import { createRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toFraction } from '@decipad/fraction';
import Plot from './Plot';

interface PlotWithProvidersParams {
  element?: Partial<PlotElement>;
  blockResults?: NotebookResults['blockResults'];
}

function F(n: number) {
  return toFraction(n);
}

const tableType: SerializedType = {
  kind: 'table',
  indexName: 'index',
  columnTypes: [
    { kind: 'string' },
    { kind: 'date', date: 'year' },
    { kind: 'date', date: 'month' },
    { kind: 'date', date: 'day' },
    { kind: 'date', date: 'hour' },
    { kind: 'date', date: 'minute' },
    { kind: 'date', date: 'second' },
    { kind: 'date', date: 'millisecond' },
    { kind: 'number', unit: null },
  ],
  columnNames: [
    'index',
    'date-year',
    'date-month',
    'date-day',
    'date-hour',
    'date-minute',
    'date-second',
    'date-millisecond',
    'simple-number',
  ],
};

const tableData = [
  ['label 1', 'label 2', 'label 3'], // index
  [100n, 200n, 300n], // date-year
  [100n, 200n, 300n], // date-month
  [100n, 200n, 300n], // date-day
  [100n, 200n, 300n], // date-hour
  [100n, 200n, 300n], // date-minute
  [100n, 200n, 300n], // date-second
  [100n, 200n, 300n], // date-millisecond
  [F(1), F(2), F(3)], // simple-number
];

const PlotWithProviders = ({
  element: _element = {},
  blockResults = {},
}: PlotWithProvidersParams) => {
  const element: PlotElement = {
    id: 'block-id',
    type: ELEMENT_PLOT,
    sourceVarName: '',
    markType: 'bar',
    xColumnName: '',
    yColumnName: '',
    sizeColumnName: '',
    colorColumnName: '',
    thetaColumnName: '',
    children: [
      {
        text: '',
      },
    ],
    ..._element,
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <TestResultsProvider blockResults={blockResults}>
        <ComputerContextProvider>
          <Plate>
            <Plot
              attributes={{
                'data-slate-node': 'element',
                ref: createRef(),
              }}
              element={element}
            />
          </Plate>
        </ComputerContextProvider>
      </TestResultsProvider>
    </DndProvider>
  );
};

it('shows nothing if no var has been selected', async () => {
  const { queryByRole } = render(<PlotWithProviders></PlotWithProviders>);
  expect(await queryByRole('graphics-document')).toBeNull();
});

it('shows nothing if var has been selected but no data', async () => {
  const { queryByRole } = render(
    <PlotWithProviders
      element={{ sourceVarName: 'varName' }}
    ></PlotWithProviders>
  );
  expect(await queryByRole('graphics-document')).toBeNull();
});

it('shows a plot if has data and options', async () => {
  const blockId = 'block-id';
  const { queryByRole } = render(
    <PlotWithProviders
      element={{ sourceVarName: 'varName' }}
      blockResults={{
        [blockId]: {
          type: 'computer-result',
          id: blockId,
          result: {
            type: tableType,
            value: tableData,
          },
        },
      }}
    ></PlotWithProviders>
  );
  expect(await queryByRole('graphics-document')).toBeDefined();
});

import { useComputer } from '@decipad/editor-hooks';
import type { PlotElement } from '@decipad/editor-types';
import { ELEMENT_PLOT, PlotDefaultColorScheme } from '@decipad/editor-types';
import { Result } from '@decipad/language-interfaces';
import { N } from '@decipad/number';
import { type SerializedType } from '@decipad/remote-computer';
import { ToastDisplay } from '@decipad/ui';
import { timeout } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import { Plate, PlateContent } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { createRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Plot from './Plot';

class ResizeObserver {
  [x: string]: any;
  constructor(callback: any) {
    this.callback = callback;
  }
  observe(element: any) {
    this.callback([
      { target: element, contentRect: { width: 500, height: 300 } },
    ]);
  }

  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

interface PlotWithProvidersParams {
  element?: Partial<PlotElement>;
  injectResult?: Result.Result;
  resultBlockId?: string;
  resultVarName?: string;
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
  [N(1), N(2), N(3)], // simple-number
];

const PlotWithProviders = ({
  element: _element = {},
  injectResult,
  resultBlockId = 'block-id',
  resultVarName = 'varName',
}: PlotWithProvidersParams) => {
  const computer = useComputer();

  useEffect(() => {
    if (injectResult) {
      const externalDataId = nanoid();
      computer.pushComputeDelta({
        external: {
          upsert: {
            [externalDataId]: injectResult,
          },
        },
        program: {
          upsert: [
            {
              type: 'identified-block',
              id: resultBlockId,
              block: {
                type: 'block',
                id: resultBlockId,
                args: [
                  {
                    type: 'assign',
                    args: [
                      { type: 'def', args: [resultVarName] },
                      {
                        type: 'externalref',
                        args: [externalDataId],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      });
    }
  }, [computer, injectResult, resultBlockId, resultVarName]);

  const element: PlotElement = {
    id: 'block-id',
    type: ELEMENT_PLOT,
    sourceVarName: '',
    markType: 'bar',
    xColumnName: '',
    xAxisLabel: '',
    yAxisLabel: '',
    sizeColumnName: '',
    orientation: 'horizontal',
    barVariant: 'grouped',
    lineVariant: 'area',
    arcVariant: 'simple',
    grid: true,
    startFromZero: true,
    mirrorYAxis: false,
    flipTable: false,
    groupByX: true,
    showDataLabel: false,
    yColumnNames: [],
    schema: 'jun-2024',
    yColumnChartTypes: [],
    colorScheme: PlotDefaultColorScheme,
    children: [
      {
        text: '',
      },
    ],
    ..._element,
  };

  return (
    <ToastDisplay>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <Plate>
            <PlateContent />
            <Plot
              attributes={{
                'data-slate-node': 'element',
                ref: createRef(),
              }}
              element={element}
            />
          </Plate>
        </BrowserRouter>
      </DndProvider>
    </ToastDisplay>
  );
};

// TODO: investigate
describe.sequential('Plot', () => {
  it('shows nothing if no var has been selected', async () => {
    const { queryByText } = render(<PlotWithProviders />);

    expect(queryByText(/No data/i)).toBeInTheDocument();
  });

  it('shows nothing if var has been selected but no data', async () => {
    const { queryByText } = render(
      <PlotWithProviders
        element={{ sourceVarName: 'varName' }}
      ></PlotWithProviders>
    );

    expect(queryByText(/No data/i)).toBeInTheDocument();
  });

  it('shows a plot if has data and options', async () => {
    const { queryByText, container } = render(
      <PlotWithProviders
        element={{
          sourceVarName: 'varName',
          xColumnName: 'label 1',
          yColumnNames: ['label 2'],
        }}
        injectResult={{
          type: tableType,
          value: tableData,
          meta: undefined,
        }}
        resultVarName="varName"
      />
    );

    await act(() => timeout(2000));

    expect(queryByText(/No data/i)).not.toBeInTheDocument();

    const svgElement = container.querySelector('svg.recharts-surface');
    expect(svgElement).toBeInTheDocument();

    const plotContainer = container.querySelector('[data-type="plot"]');
    expect(plotContainer).toBeVisible();

    const captionInput = container.querySelector(
      'input[placeholder="Add a caption to this chart"]'
    );
    expect(captionInput).toBeInTheDocument();

    const tooltip = container.querySelector('.recharts-tooltip-wrapper');
    expect(tooltip).toBeInTheDocument();

    const lines = container.querySelectorAll(
      '.recharts-cartesian-grid-horizontal'
    );
    expect(lines.length).toBeGreaterThan(0);
  });
});

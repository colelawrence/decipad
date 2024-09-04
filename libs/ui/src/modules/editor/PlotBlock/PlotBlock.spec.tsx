import { beforeEach, describe, it, expect } from 'vitest';
import { MarkType } from '@decipad/editor-types';
import { render } from '@testing-library/react';
import { ToastDisplay } from 'libs/ui/src/shared';
import { SessionProvider } from 'next-auth/react';
import { ComponentProps } from 'react';
import { PlotBlock } from './PlotBlock';
import { PlotBlockProps } from './types';

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

let props: Record<string, string>;
let wrapper: React.FC<React.PropsWithChildren<unknown>>;
beforeEach(() => {
  props = {};

  wrapper = ({ children }) => (
    <SessionProvider
      session={{
        expires: new Date(Date.now() + 1000000).toISOString(),
        user: {
          name: 'userName',
          email: 'user@email.com',
        },
      }}
    >
      <ToastDisplay>{children}</ToastDisplay>
    </SessionProvider>
  );
});

const setter = (prop: string) => (value: string) => {
  props[prop] = value;
};

const firstDataLabel = 'label 1';
const result: ComponentProps<typeof PlotBlock>['result'] = {
  data: {
    table: [
      { aa: firstDataLabel, bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
};
const noResult: ComponentProps<typeof PlotBlock>['result'] = undefined;

const setArray = () => {};

const plotParamSetters = {
  setSourceVarName: setter('sourceVarName'),
  setMarkType: setter('markType'),
  setXColumnName: setter('xColumnName'),
  setYColumnName: setter('yColumnName'),
  setY2ColumnName: setter('y2ColumnName'),
  setSizeColumnName: setter('sizeColumnName'),
  setColorColumnName: setter('colorColumnName'),
  setThetaColumnName: setter('thetaColumnName'),
  setColorScheme: setter('colorScheme'),
  setShape: setter('shape'),
  setYAxisLabel: setter('xAxisLabel'),
  setXAxisLabel: setter('yAxisLabel'),
  setLabelColumnName: setter('labelColumnName'),
  setOtherYColumnNames: setArray,
  setOrientation: setter('orientation'),
  setYColumnNames: setArray,
  setYColumnChartTypes: setArray,
  setBarVariant: setter('barVariant'),
  setLineVariant: setter('lineVariant'),
  setArcVariant: setter('arcVariant'),
  setGrid: (value: boolean) => {
    props.grid = value ? 'true' : 'false';
  },
  setStartFromZero: (value: boolean) => {
    props.startFromZero = value ? 'true' : 'false';
  },
  setMirrorYAxis: (value: boolean) => {
    props.startFromZero = value ? 'true' : 'false';
  },
  setFlipTable: (value: boolean) => {
    props.startFromZero = value ? 'true' : 'false';
  },
  setGroupByX: (group: boolean) => {
    props.groupByX = group ? 'true' : 'false';
  },
  setShowDataLabel: (value: boolean) => {
    props.showDataLabel = value ? 'true' : 'false';
  },
};

const founderEquityPlotBlockParams = {
  readOnly: false,
  plotParams: {
    ...plotParamSetters,
    sourceVarNameOptions: [
      'Founders',
      'Allocations',
      'InitialStakeHolders',
      'NewRound',
      'Cap',
      'Cap Table',
    ],
    sourceExprRefOptions: [
      'exprRef_4VtgkVbL8xGrDW2h7QyWk',
      'exprRef_oxsvH18KL5Qk8S7Ykjby_',
      'exprRef_pe_FDBtTOr0n_SSq6fKX_',
      'exprRef_jcHzlY3Jjq73U_K878Jdd',
      'exprRef__lu8bjAbBxiVdA9tIx8Pk',
      'exprRef_fPQZ3RrPR1bsYb4aP5BNi',
    ],
    columnNameOptions: ['Holder', 'Class', 'Shares', 'Percentage'],
    columnTypeOptions: [
      {
        kind: 'string',
      },
      {
        kind: 'string',
      },
      {
        kind: 'number',
        unit: [
          {
            unit: 'shares',
            exp: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            multiplier: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            known: false,
          },
        ],
      },
      {
        kind: 'number',
        numberFormat: 'percentage',
      },
    ],
    barVariant: 'grouped',
    lineVariant: 'simple',
    arcVariant: 'simple',
    orientation: 'horizontal',
    grid: true,
    startFromZero: true,
    showDataLabel: false,
    flipTable: false,
    mirrorYAxis: false,
    groupByX: false,
    colorScheme: 'multicolor_orange',
    children: [
      {
        text: '',
      },
    ],
    id: 'ZjW3TseoZvbgF6AO4zFQ4',
    type: 'plot',
    title: '',
    sourceVarName: 'exprRef_4VtgkVbL8xGrDW2h7QyWk',
    xColumnName: 'Holder',
    xAxisLabel: '',
    yAxisLabel: '',
    labelColumnName: '',
    markType: 'combo',
    sizeColumnName: '',
    yColumnNames: ['Shares'],
    yColumnChartTypes: ['bar'],
    schema: 'jun-2024',
  },
  result: {
    data: {
      table: [
        {
          Holder: 'Sarah Johnson',
          Shares: 4000000,
        },
        {
          Holder: 'Michael Smith',
          Shares: 3000000,
        },
        {
          Holder: 'Alice Williams',
          Shares: 3000000,
        },
        {
          Holder: 'ESOP',
          Shares: 1000000,
        },
      ],
    },
    children: [
      {
        text: '',
      },
    ],
    id: 'ZjW3TseoZvbgF6AO4zFQ4',
    type: 'plot',
    title: '',
    sourceVarName: 'exprRef_4VtgkVbL8xGrDW2h7QyWk',
    xColumnName: 'Holder',
    xAxisLabel: '',
    yAxisLabel: '',
    labelColumnName: '',
    markType: 'combo',
    sizeColumnName: '',
    yColumnNames: ['Shares'],
    yColumnChartTypes: ['bar'],
    barVariant: 'grouped',
    lineVariant: 'simple',
    arcVariant: 'simple',
    orientation: 'horizontal',
    grid: true,
    startFromZero: true,
    showDataLabel: false,
    groupByX: false,
    colorScheme: 'multicolor_orange',
    schema: 'jun-2024',
  },
  title: '',
  chartUuid: 'chart-ZjW3TseoZvbgF6AO4zFQ4-18.6.2024',
} as PlotBlockProps;

const revBarChartPlotBlockParams = {
  readOnly: false,
  plotParams: {
    sourceVarNameOptions: [
      'Deal_Pipeline',
      'Close_Probability',
      'Deal Pipeline Snapshot',
    ],
    ...plotParamSetters,
    sourceExprRefOptions: [
      'exprRef_jwsdH_E22OSz3M0r_DMvU',
      'exprRef_lY73gvGtpjMaywcS7khHV',
      'exprRef_0hPQtWafTjqgPuM1r2kxW',
    ],
    columnNameOptions: [
      'Company',
      'Veritcal',
      'Deal_Stage',
      'Revenue_Opportunity',
      'Revenue_Booked',
      'Revenue_Forecast',
    ],
    columnTypeOptions: [
      {
        kind: 'string',
      },
      {
        kind: 'string',
      },
      {
        kind: 'string',
      },
      {
        kind: 'number',
        unit: [
          {
            unit: '$',
            exp: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            multiplier: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            known: true,
            baseQuantity: 'USD',
            baseSuperQuantity: 'currency',
          },
        ],
      },
      {
        kind: 'number',
        unit: [
          {
            unit: '$',
            exp: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            multiplier: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            known: true,
            baseQuantity: 'USD',
            baseSuperQuantity: 'currency',
          },
        ],
      },
      {
        kind: 'number',
        unit: [
          {
            unit: '$',
            exp: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            multiplier: {
              n: '1',
              d: '1',
              s: '1',
              infinite: false,
            },
            known: true,
            baseQuantity: 'USD',
            baseSuperQuantity: 'currency',
          },
        ],
      },
    ],
    barVariant: 'grouped',
    lineVariant: 'simple',
    arcVariant: 'simple',
    orientation: 'horizontal',
    flipTable: false,
    mirrorYAxis: false,
    grid: true,
    startFromZero: true,
    showDataLabel: false,
    groupByX: true,
    colorScheme: 'monochrome_purple',
    children: [
      {
        text: '',
      },
    ],
    id: 'Y9BqQFriC6mvjYQttRfHO',
    type: 'plot',
    title: 'Revenue opportunity by stage',
    sourceVarName: 'exprRef_jwsdH_E22OSz3M0r_DMvU',
    xColumnName: 'Deal_Stage',
    yColumnName: 'Revenue_Opportunity',
    markType: 'bar',
    thetaColumnName: 'Revenue_Opportunity',
    sizeColumnName: '',
    colorColumnName: 'Deal_Stage',
    y2ColumnName: 'Deal_Stage',
    yColumnNames: ['Revenue_Opportunity', 'Revenue_Booked', 'Revenue_Forecast'],
    yColumnChartTypes: ['bar', 'bar', 'bar'],
    schema: 'jun-2024',
  },
  result: {
    data: {
      table: [
        {
          Deal_Stage: 'closed',
          Revenue_Opportunity: 10000,
          Revenue_Booked: 11250,
          Revenue_Forecast: 11250,
        },
        {
          Deal_Stage: 'negotiations',
          Revenue_Opportunity: 25000,
          Revenue_Booked: 0,
          Revenue_Forecast: 12500,
        },
        {
          Deal_Stage: 'contract',
          Revenue_Opportunity: 125000,
          Revenue_Booked: 0,
          Revenue_Forecast: 93750,
        },
        {
          Deal_Stage: 'engaged',
          Revenue_Opportunity: 130000,
          Revenue_Booked: 0,
          Revenue_Forecast: 32500,
        },
        {
          Deal_Stage: 'engaged',
          Revenue_Opportunity: 75000,
          Revenue_Booked: 0,
          Revenue_Forecast: 18750,
        },
        {
          Deal_Stage: 'engaged',
          Revenue_Opportunity: 82500,
          Revenue_Booked: 73500,
          Revenue_Forecast: 20625,
        },
        {
          Deal_Stage: 'closed',
          Revenue_Opportunity: 65700,
          Revenue_Booked: 105000,
          Revenue_Forecast: 105000,
        },
        {
          Deal_Stage: 'negotiations',
          Revenue_Opportunity: 105000,
          Revenue_Booked: 0,
          Revenue_Forecast: 52500,
        },
        {
          Deal_Stage: 'negotiations',
          Revenue_Opportunity: 250000,
          Revenue_Booked: 0,
          Revenue_Forecast: 125000,
        },
        {
          Deal_Stage: 'contract',
          Revenue_Opportunity: 165000,
          Revenue_Booked: 0,
          Revenue_Forecast: 123750,
        },
        {
          Deal_Stage: 'negotiations',
          Revenue_Opportunity: 42000,
          Revenue_Booked: 0,
          Revenue_Forecast: 21000,
        },
        {
          Deal_Stage: 'contract',
          Revenue_Opportunity: 32000,
          Revenue_Booked: 0,
          Revenue_Forecast: 24000,
        },
        {
          Deal_Stage: 'closed',
          Revenue_Opportunity: 150000,
          Revenue_Booked: 50000,
          Revenue_Forecast: 50000,
        },
      ],
    },
    children: [
      {
        text: '',
      },
    ],
    id: 'Y9BqQFriC6mvjYQttRfHO',
    type: 'plot',
    title: 'Revenue opportunity by stage',
    sourceVarName: 'exprRef_jwsdH_E22OSz3M0r_DMvU',
    xColumnName: 'Deal_Stage',
    yColumnName: 'Revenue_Opportunity',
    markType: 'bar',
    thetaColumnName: 'Revenue_Opportunity',
    sizeColumnName: '',
    colorColumnName: 'Deal_Stage',
    colorScheme: 'monochrome_purple',
    y2ColumnName: 'Deal_Stage',
    yColumnNames: ['Revenue_Opportunity', 'Revenue_Booked', 'Revenue_Forecast'],
    orientation: 'horizontal',
    grid: true,
    startFromZero: true,
    groupByX: true,
    showDataLabel: false,
    barVariant: 'grouped',
    lineVariant: 'simple',
    arcVariant: 'simple',
    yColumnChartTypes: ['bar', 'bar', 'bar'],
    schema: 'jun-2024',
  },
  title: 'Revenue opportunity by stage',
  chartUuid: 'chart-Y9BqQFriC6mvjYQttRfHO-18.6.2024',
} as PlotBlockProps;

const plotParams: (
  markType: MarkType,
  sourceVarName?: string
) => ComponentProps<typeof PlotBlock>['plotParams'] = (
  markType,
  sourceVarName
) => ({
  sourceVarName:
    sourceVarName === undefined ? 'source var name' : sourceVarName,
  sourceExprRefOptions: [
    'exprRef_sTyUI7bAdmn0_OyxJz_Oj',
    'exprRef_sTyUI7bAdmn0_OyxJz_Og',
  ],
  columnTypeOptions: [{ kind: 'table' } as any, { kind: 'table' }],
  sourceVarNameOptions: [
    'source var name option 1',
    'source var name option 2',
  ],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType,
  xColumnName: 'x column name',
  sizeColumnName: 'size column name',
  colorScheme: 'monochrome_blue',
  shape: '',
  xAxisLabel: '',
  yAxisLabel: '',
  orientation: 'horizontal',
  otherColumnNames: [],
  yColumnNames: [],
  yColumnChartTypes: [],
  barVariant: 'grouped',
  lineVariant: 'area100',
  flipTable: false,
  mirrorYAxis: false,
  arcVariant: 'simple',
  startFromZero: true,
  groupByX: true,
  grid: true,
  showDataLabel: false,
  schema: 'jun-2024',
  ...plotParamSetters,
});

const plotProps: (
  markType: MarkType,
  sourceVarName?: string
) => ComponentProps<typeof PlotBlock> = (markType, sourceVarName) => ({
  title: 'Title',
  readOnly: false,
  result,
  chartUuid: 'chart-123',
  plotParams: plotParams(markType, sourceVarName),
});

describe('base tests', () => {
  it('displays the "Select a table" component if no table selected', () => {
    const { queryByText } = render(
      <PlotBlock
        {...plotProps('arc', '')}
        result={noResult}
        readOnly={false}
      />,
      { wrapper }
    );

    expect(queryByText(/No data/i)).toBeInTheDocument();
  });

  it('displays the plot settings for a line plot unless readonly', async () => {
    const { queryAllByText, rerender } = render(
      <PlotBlock {...plotProps('line')} readOnly={false} />,
      { wrapper }
    );
    expect(queryAllByText('Settings')).not.toHaveLength(0);

    rerender(<PlotBlock {...plotProps('line')} readOnly />);
    expect(queryAllByText('Settings')).toHaveLength(0);
  });
});

describe('pipeline chart from sample in sales doc', () => {
  beforeEach(() => {
    (SVGElement.prototype as any).getComputedTextLength = () => 100;
  });
  it('has settings', () => {
    const { queryByText } = render(
      <PlotBlock {...revBarChartPlotBlockParams} />,
      { wrapper }
    );

    expect(queryByText(/Settings/i)).toBeInTheDocument();
  });

  it('renders line elements for the grid', () => {
    const { container } = render(
      <PlotBlock {...revBarChartPlotBlockParams} />,
      { wrapper }
    );

    expect(container.querySelectorAll('line')).toHaveLength(11);
  });

  it('renders the "Add label" text', () => {
    const { getAllByText } = render(
      <PlotBlock {...revBarChartPlotBlockParams} />,
      { wrapper }
    );

    expect(getAllByText('Add label')).toHaveLength(2);
  });

  it('does not render the "Add label" text for readOnly', () => {
    const { queryByText } = render(
      <PlotBlock {...revBarChartPlotBlockParams} readOnly={true} />,
      { wrapper }
    );

    expect(queryByText('Add label')).not.toBeInTheDocument();
  });

  it('renders input placeholder when readOnly is false', () => {
    const { container } = render(
      <PlotBlock {...revBarChartPlotBlockParams} readOnly={false} />,
      { wrapper }
    );

    const captionInput = container.querySelector(
      'input[placeholder="Add a caption to this chart"]'
    );
    expect(captionInput).toBeInTheDocument();
  });

  it('renders the input when readOnly is true if we have a title in element', () => {
    const { container } = render(
      <PlotBlock {...revBarChartPlotBlockParams} readOnly={true} />,
      { wrapper }
    );

    const captionInput = container.querySelector(
      'input[placeholder="Add a caption to this chart"]'
    );
    expect(captionInput).toBeInTheDocument();
  });

  it('doesnt render input readOnly is true and there is no caption', () => {
    const { container } = render(
      <PlotBlock {...revBarChartPlotBlockParams} title="" readOnly={true} />,
      { wrapper }
    );

    const captionInput = container.querySelector(
      'input[placeholder="Add a caption to this chart"]'
    );
    expect(captionInput).not.toBeInTheDocument();
  });

  it('renders the text "negotiations"', () => {
    const { getByText } = render(
      <PlotBlock {...revBarChartPlotBlockParams} />,
      { wrapper }
    );

    expect(getByText('negotiations')).toBeInTheDocument();
  });

  it('legend includes Revenue_Opportunity, Revenue_Booked, and Revenue_Forecast', () => {
    const { getByText } = render(
      <PlotBlock {...revBarChartPlotBlockParams} />,
      { wrapper }
    );

    expect(getByText('Revenue_Opportunity')).toBeInTheDocument();
    expect(getByText('Revenue_Booked')).toBeInTheDocument();
    expect(getByText('Revenue_Forecast')).toBeInTheDocument();
  });

  it('renders the grid when grid is true', () => {
    const { container } = render(
      <PlotBlock
        {...revBarChartPlotBlockParams}
        plotParams={{ ...revBarChartPlotBlockParams.plotParams, grid: true }}
      />,
      { wrapper }
    );

    expect(
      container.querySelector('.recharts-cartesian-grid')
    ).toBeInTheDocument();
    expect(
      container.querySelector('.recharts-cartesian-grid-horizontal')
    ).toBeInTheDocument();
  });

  it('does not render the grid when grid is false', () => {
    const { container } = render(
      <PlotBlock
        {...revBarChartPlotBlockParams}
        plotParams={{ ...revBarChartPlotBlockParams.plotParams, grid: false }}
      />,
      { wrapper }
    );

    expect(
      container.querySelector('.recharts-cartesian-grid')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('.recharts-cartesian-grid-horizontal')
    ).not.toBeInTheDocument();
  });

  it('can render bar charts horizontally', () => {
    const { container } = render(
      <PlotBlock
        {...revBarChartPlotBlockParams}
        plotParams={{
          ...revBarChartPlotBlockParams.plotParams,
          orientation: 'horizontal',
        }}
      />,
      { wrapper }
    );

    const xAxisText = container.querySelectorAll(
      '.recharts-xAxis .recharts-cartesian-axis-tick text'
    );
    const yAxisText = container.querySelectorAll(
      '.recharts-yAxis .recharts-cartesian-axis-tick text'
    );

    const negotiationsInXAxis = Array.from(xAxisText).some(
      (text) => text.textContent === 'negotiations'
    );
    const negotiationsInYAxis = Array.from(yAxisText).some(
      (text) => text.textContent === 'negotiations'
    );

    expect(negotiationsInXAxis).toBe(true);
    expect(negotiationsInYAxis).toBe(false);
  });

  it('can render bar charts vertically', () => {
    const { container } = render(
      <PlotBlock
        {...revBarChartPlotBlockParams}
        plotParams={{
          ...revBarChartPlotBlockParams.plotParams,
          orientation: 'vertical',
        }}
      />,
      { wrapper }
    );

    const xAxisText = container.querySelectorAll(
      '.recharts-xAxis .recharts-cartesian-axis-tick text'
    );
    const yAxisText = container.querySelectorAll(
      '.recharts-yAxis .recharts-cartesian-axis-tick text'
    );

    const negotiationsInXAxis = Array.from(xAxisText).some(
      (text) => text.textContent === 'negotiations'
    );
    const negotiationsInYAxis = Array.from(yAxisText).some(
      (text) => text.textContent === 'negotiations'
    );

    expect(negotiationsInXAxis).toBe(false);
    expect(negotiationsInYAxis).toBe(true);
  });

  it('Doesnt have a legend when we have only one column to plot', () => {
    const { container } = render(
      <PlotBlock
        {...revBarChartPlotBlockParams}
        plotParams={{
          ...revBarChartPlotBlockParams.plotParams,
          markType: 'line',
          grid: false,
          yColumnNames: [revBarChartPlotBlockParams.plotParams.yColumnNames[0]],
        }}
        readOnly={true}
      />,
      { wrapper }
    );

    const legend = container.querySelector('.recharts-legend-wrapper');

    expect(legend).not.toBeInTheDocument();
  });
});

describe('founder equity', () => {
  beforeEach(() => {
    (SVGElement.prototype as any).getComputedTextLength = () => 100;
  });
  it('can render a combo chart', () => {
    const { container } = render(
      <PlotBlock {...founderEquityPlotBlockParams} />,
      { wrapper }
    );

    // one set, four data points
    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(1);
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      4
    );
  });

  it('combo chart supports lines', () => {
    const { container } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          yColumnChartTypes: ['line'],
        }}
      />,
      { wrapper }
    );

    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(0);
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      0
    );
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(1);
  });

  it('can do pie charts', () => {
    const { container } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          markType: 'arc',
        }}
      />,
      { wrapper }
    );

    expect(container.querySelectorAll('.recharts-pie')).toHaveLength(1);
  });

  it('can do donut charts', () => {
    const { container, getAllByText } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          markType: 'arc',
          arcVariant: 'donut',
        }}
      />,
      { wrapper }
    );

    // still a pie chart, but you can set a label in the hole
    expect(getAllByText('Add label')).toHaveLength(1);
    expect(container.querySelectorAll('.recharts-pie')).toHaveLength(1);
  });

  it('can do an area chart', () => {
    const { container } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          markType: 'area',
        }}
      />,
      { wrapper }
    );

    expect(container.querySelectorAll('.recharts-curve')).toHaveLength(2);
  });

  it('Funnel is a bunch of bar charts', () => {
    const { container } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          markType: 'funnel',
        }}
      />,
      { wrapper }
    );

    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(1);
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      4
    );
  });

  it('Radar chart is at least polar, and renders', () => {
    const { container } = render(
      <PlotBlock
        {...founderEquityPlotBlockParams}
        plotParams={{
          ...founderEquityPlotBlockParams.plotParams,
          markType: 'radar',
        }}
      />,
      { wrapper }
    );

    expect(container.querySelectorAll('.recharts-polar-grid')).toHaveLength(1);
  });
});

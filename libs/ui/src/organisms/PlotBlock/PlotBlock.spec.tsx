import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { MarkType } from '../PlotParams/PlotParams';
import { PlotBlock } from './PlotBlock';

let props: Record<string, string>;
beforeEach(() => {
  props = {};
});

const firstDataLabel = 'label 1';
const result: ComponentProps<typeof PlotBlock>['result'] = {
  onError: (err: Error) => {
    throw err;
  },
  spec: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { name: 'table' },
    encoding: {
      x: { field: 'aa', type: 'nominal' },
      y: { field: 'bb', type: 'quantitative', scale: { domain: [2, 26] } },
      size: { field: 'bb', type: 'quantitative', scale: { domain: [2, 26] } },
      color: { field: 'aa', type: 'nominal' },
    },
    mark: { type: 'circle', tooltip: true },
    config: {
      encoding: {
        color: {
          scheme: 'monochrome_purple_light',
        },
      },
    },
  },
  data: {
    table: [
      { aa: firstDataLabel, bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
  repeatedColumns: [],
};

const setter = (prop: string) => (value: string) => {
  props[prop] = value;
};

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
  sourceVarNameOptions: [
    'source var name option 1',
    'source var name option 2',
  ],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType,
  xColumnName: 'x column name',
  yColumnName: 'y column name',
  y2ColumnName: 'y2 column name',
  sizeColumnName: 'size column name',
  colorColumnName: 'color column name',
  thetaColumnName: 'color column name',
  colorScheme: 'color scheme',
  setSourceVarName: setter('sourceVarName'),
  setMarkType: setter('markType'),
  setXColumnName: setter('xColumnName'),
  setYColumnName: setter('yColumnName'),
  setY2ColumnName: setter('y2ColumnName'),
  setSizeColumnName: setter('sizeColumnName'),
  setColorColumnName: setter('colorColumnName'),
  setThetaColumnName: setter('thetaColumnName'),
  setColorScheme: setter('colorScheme'),
  shape: '',
  setShape: setter('shape'),
});

const plotParamsNoSources: (
  markType: MarkType
) => ComponentProps<typeof PlotBlock>['plotParams'] = (markType) => ({
  sourceVarName: '',
  sourceExprRefOptions: [],
  sourceVarNameOptions: [],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType,
  xColumnName: 'x column name',
  yColumnName: 'y column name',
  y2ColumnName: 'y2 column name',
  sizeColumnName: 'size column name',
  colorColumnName: 'color column name',
  thetaColumnName: 'color column name',
  colorScheme: 'color scheme',
  setSourceVarName: setter('sourceVarName'),
  setMarkType: setter('markType'),
  setXColumnName: setter('xColumnName'),
  setYColumnName: setter('yColumnName'),
  setY2ColumnName: setter('y2ColumnName'),
  setSizeColumnName: setter('sizeColumnName'),
  setColorColumnName: setter('colorColumnName'),
  setThetaColumnName: setter('thetaColumnName'),
  setColorScheme: setter('colorScheme'),
  shape: '',
  setShape: setter('shape'),
});

const plotProps: (
  markType: MarkType,
  sourceVarName?: string
) => ComponentProps<typeof PlotBlock> = (markType, sourceVarName) => ({
  title: 'Title',
  readOnly: false,
  result,
  plotParams: plotParams(markType, sourceVarName),
});

it('displays the "Select a table" component if no table selected', () => {
  const { queryByLabelText } = render(
    <PlotBlock {...plotProps('arc', '')} readOnly={false} />
  );

  expect(queryByLabelText(/select a table/i)).toBeInTheDocument();
});

it('displays a warning if no tables exist', () => {
  const plotPropsNoSources: ComponentProps<typeof PlotBlock> = {
    title: 'Title',
    readOnly: false,
    result,
    plotParams: plotParamsNoSources('arc'),
  };

  const { queryByText } = render(
    <PlotBlock {...plotPropsNoSources} readOnly={false} />
  );

  const text =
    "You can't create a chart because this document does not include any tables";
  expect(queryByText(text)).toBeInTheDocument();
});

it('displays the plot settings for a line plot unless readonly', async () => {
  const { queryAllByText, rerender } = render(
    <PlotBlock {...plotProps('line')} readOnly={false} />
  );
  expect(await queryAllByText('Settings')).not.toHaveLength(0);

  rerender(<PlotBlock {...plotProps('line')} readOnly />);
  expect(await queryAllByText('Settings')).toHaveLength(0);
});

it('displays the plot settings for a pie chart unless readonly', async () => {
  const { queryAllByText, rerender } = render(
    <PlotBlock {...plotProps('arc')} readOnly={false} />
  );
  expect(await queryAllByText('Settings')).not.toHaveLength(0);

  rerender(<PlotBlock {...plotProps('arc')} readOnly />);
  expect(await queryAllByText('Settings')).toHaveLength(0);
});

it('displays the plot settings for an area chart unless readonly', async () => {
  const { queryAllByText, rerender } = render(
    <PlotBlock {...plotProps('area')} readOnly={false} />
  );
  expect(await queryAllByText('Settings')).not.toHaveLength(0);

  rerender(<PlotBlock {...plotProps('area')} readOnly />);
  expect(await queryAllByText('Settings')).toHaveLength(0);
});

it('displays the plot settings for a scatter plot unless readonly', async () => {
  const { queryAllByText, rerender } = render(
    <PlotBlock {...plotProps('point')} readOnly={false} />
  );
  expect(await queryAllByText('Settings')).not.toHaveLength(0);

  rerender(<PlotBlock {...plotProps('point')} readOnly />);
  expect(await queryAllByText('Settings')).toHaveLength(0);
});

it('shows a given error message', () => {
  const { getByText } = render(
    <PlotBlock {...plotProps('line')} errorMessage="Oopsie whoopsie." />
  );
  expect(getByText('Oopsie whoopsie.')).toBeVisible();
});

import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { PlotBlock } from './PlotBlock';

let props: Record<string, string>;
afterEach(() => {
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
      y: { field: 'bb', type: 'quantitative' },
      size: { field: 'bb', type: 'quantitative' },
      color: { field: 'aa', type: 'nominal' },
    },
    mark: { type: 'circle', tooltip: true },
  },
  data: {
    table: [
      { aa: firstDataLabel, bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
};

const setter = (prop: string) => (value: string) => {
  props[prop] = value;
};

const plotParams: ComponentProps<typeof PlotBlock>['plotParams'] = {
  sourceVarName: 'source var name',
  sourceVarNameOptions: [
    'source var name option 1',
    'source var name option 2',
  ],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType: 'circle',
  xColumnName: 'x column name',
  yColumnName: 'y column name',
  sizeColumnName: 'size column name',
  colorColumnName: 'color column name',
  thetaColumnName: 'color column name',
  setSourceVarName: setter('sourceVarName'),
  setMarkType: setter('markType'),
  setXColumnName: setter('xColumnName'),
  setYColumnName: setter('yColumnName'),
  setSizeColumnName: setter('sizeColumnName'),
  setColorColumnName: setter('colorColumnName'),
  setThetaColumnName: setter('thetaColumnName'),
};

const plotProps: ComponentProps<typeof PlotBlock> = {
  readOnly: false,
  result,
  plotParams,
};

it('displays the plot params unless readonly', () => {
  const { getByLabelText, queryByLabelText, rerender } = render(
    <PlotBlock {...plotProps} readOnly={false} />
  );
  expect(getByLabelText(/source/i)).toBeVisible();

  rerender(<PlotBlock {...plotProps} readOnly />);
  expect(queryByLabelText(/source/i)).not.toBeInTheDocument();
});

it('shows a given error message', () => {
  const { getByText } = render(
    <PlotBlock {...plotProps} errorMessage="Oopsie whoopsie." />
  );
  expect(getByText('Oopsie whoopsie.')).toBeVisible();
});

it('renders a plot with the given result', async () => {
  const { findAllByText } = render(<PlotBlock {...plotProps} />);
  expect(await findAllByText(firstDataLabel)).not.toHaveLength(0);
});

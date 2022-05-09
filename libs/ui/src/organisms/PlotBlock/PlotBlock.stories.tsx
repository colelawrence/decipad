import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { PlotBlock } from './PlotBlock';

const plotParamProps: Record<string, string> = {};

const setter = (prop: string) => (value: string) => {
  plotParamProps[prop] = value;
};

const plotResult: ComponentProps<typeof PlotBlock>['result'] = {
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
      { aa: 'label 1', bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
};

const props: ComponentProps<typeof PlotBlock> = {
  title: 'Plot',
  readOnly: false,
  errorMessage: '',
  plotParams: {
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
    thetaColumnName: 'theta column name',
    colorScheme: 'color scheme',
    setSourceVarName: setter('sourceVarName'),
    setMarkType: setter('markType'),
    setXColumnName: setter('xColumnName'),
    setYColumnName: setter('yColumnName'),
    setSizeColumnName: setter('sizeColumnName'),
    setColorColumnName: setter('colorColumnName'),
    setThetaColumnName: setter('thetaColumnName'),
    setColorScheme: setter('colorScheme'),
  },
  result: plotResult,
};

export default {
  title: 'Organisms / Editor / Charts / Block',
  component: PlotBlock,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story = () => <PlotBlock {...props} />;

const withMessageArgs = {
  errorMessage: 'Something awful just happened',
};
export const WithErrorMessage: Story<typeof withMessageArgs> = (extraProps) => (
  <PlotBlock {...props} {...extraProps} />
);
WithErrorMessage.args = withMessageArgs;

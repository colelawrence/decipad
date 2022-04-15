import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { PlotParams } from './PlotParams';

const props: Record<string, string> = {};

const setter = (prop: string) => (value: string) => {
  props[prop] = value;
};

const params: ComponentProps<typeof PlotParams> = {
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
};

export default {
  title: 'Organisms / Plots / Plot Params',
  component: PlotParams,
  args: params,
} as Meta;

export const Normal: Story = () => <PlotParams {...params} />;

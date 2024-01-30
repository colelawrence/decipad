import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { PlotParams } from './PlotParams';

const props: Record<string, string> = {};

const setter = (prop: string) => (value: string) => {
  props[prop] = value;
};

export const params: ComponentProps<typeof PlotParams> = {
  sourceVarName: 'source var name',
  sourceVarNameOptions: [
    'source var name option 1',
    'source var name option 2',
  ],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType: 'line',
  xColumnName: 'x column name',
  yColumnName: 'y column name',
  y2ColumnName: 'y2 column name',
  sizeColumnName: 'size column name',
  colorColumnName: 'color column name',
  thetaColumnName: 'theta column name',
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
};

export default {
  title: 'Organisms / Editor / Charts / Params',
  component: PlotParams,
  args: params,
} as Meta;

export const Normal: StoryFn = () => <PlotParams {...params} />;

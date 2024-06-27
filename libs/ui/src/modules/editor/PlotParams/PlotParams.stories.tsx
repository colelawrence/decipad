import { Meta, StoryFn } from '@storybook/react';
import { PlotParams } from './PlotParams';
import { plotParams } from './test-helpers';

export default {
  title: 'Organisms / Editor / Charts / Params',
  component: PlotParams,
  args: plotParams,
} as Meta;

export const Normal: StoryFn = () => <PlotParams {...plotParams} />;

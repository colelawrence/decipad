import { Meta, StoryFn } from '@storybook/react';
import type { ComponentProps } from 'react';
import { PlotResult } from './PlotResult';

const params: ComponentProps<typeof PlotResult> = {
  data: {
    table: [
      { aa: 'label 1', bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
};

export default {
  title: 'Organisms / Editor / Charts / Result',
  component: PlotResult,
  args: params,
} as Meta;

export const Normal: StoryFn = () => <PlotResult {...params} />;

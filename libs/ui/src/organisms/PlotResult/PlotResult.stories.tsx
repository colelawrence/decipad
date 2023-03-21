import { Meta, Story } from '@storybook/react';
import type { ComponentProps } from 'react';
import { PlotResult } from './PlotResult';

const params: ComponentProps<typeof PlotResult> = {
  onError: (err) => {
    throw err;
  },
  spec: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { name: 'table' },
    config: {
      encoding: {
        color: {
          scheme: 'monochrome_purple_light',
        },
      },
    },
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

export default {
  title: 'Organisms / Editor / Charts / Result',
  component: PlotResult,
  args: params,
} as Meta;

export const Normal: Story = () => <PlotResult {...params} />;

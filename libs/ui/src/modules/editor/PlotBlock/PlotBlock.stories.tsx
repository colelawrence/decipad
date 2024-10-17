import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { plotParams } from '../PlotParams/test-helpers';
import { PlotBlock } from './PlotBlock';
import { PlotBlockProps } from './types';

const plotResult: ComponentProps<typeof PlotBlock>['result'] = {
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
  chartUuid: '123',
  plotParams,
  result: plotResult,
};

export default {
  title: 'Organisms / Editor / Charts / Block',
  component: PlotBlock,
} as Meta;

export const Normal: StoryFn = () => <PlotBlock {...props} />;

const withMessageArgs = {
  errorMessage: 'Something awful just happened',
};
export const WithErrorMessage: StoryFn<typeof withMessageArgs> = (
  extraProps: PlotBlockProps
) => <PlotBlock {...props} {...extraProps} />;
WithErrorMessage.args = withMessageArgs;

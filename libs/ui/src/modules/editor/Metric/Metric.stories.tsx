import { Meta, StoryFn } from '@storybook/react';
import { Metric, MetricProps } from './Metric';
import { ResultType } from '@decipad/computer-interfaces';

export default {
  title: 'Organisms / Editor / Metric',
  component: Metric,
} as Meta;

export const Normal: StoryFn<MetricProps> = () => (
  <Metric
    caption="Metric"
    mainResult={demoResult as unknown as ResultType}
    readOnly={false}
    onClickEdit={() => console.info('clicked')}
  ></Metric>
);

export const ReadOnly: StoryFn<MetricProps> = () => (
  <Metric
    caption="Metric"
    mainResult={demoResult as unknown as ResultType}
    readOnly={true}
  ></Metric>
);

const demoResult = {
  type: {
    kind: 'number',
    unit: null,
  },
  value: {
    n: '57',
    d: '1',
    s: '1',
    infinite: false,
  },
};

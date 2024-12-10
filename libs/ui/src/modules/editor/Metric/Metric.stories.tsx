import { Meta, StoryFn } from '@storybook/react';
import { Metric, MetricProps } from './Metric';

export default {
  title: 'Organisms / Editor / Metric',
  component: Metric,
} as Meta;

export const Normal: StoryFn<MetricProps> = ({ ...props }: MetricProps) => (
  <Metric {...props} />
);

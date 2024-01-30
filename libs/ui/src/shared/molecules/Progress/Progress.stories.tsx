import { Meta, StoryFn } from '@storybook/react';
import { Progress, ProgressProps } from './Progress';

const args: ProgressProps = {
  progress: 50,
  label: 'Progress',
};

export default {
  title: 'Molecules / UI / Progress',
  component: Progress,
  args,
} as Meta;

export const Normal: StoryFn<ProgressProps> = (props) => (
  <Progress {...props} />
);

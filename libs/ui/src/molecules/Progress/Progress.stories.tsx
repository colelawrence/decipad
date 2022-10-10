import { Meta, Story } from '@storybook/react';
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

export const Normal: Story<ProgressProps> = (props) => <Progress {...props} />;

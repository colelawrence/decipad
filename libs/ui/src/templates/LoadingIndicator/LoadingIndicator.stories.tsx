import { Meta, Story } from '@storybook/react';
import { LoadingIndicator } from './LoadingIndicator';

export default {
  title: 'Templates / Loading Indicator',
} as Meta;

export const Normal: Story = () => <LoadingIndicator />;

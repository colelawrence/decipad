import { Meta, StoryFn } from '@storybook/react';
import { LoadingIndicator } from './LoadingIndicator';

export default {
  title: 'Templates / Loading Indicator',
} as Meta;

export const Normal: StoryFn = () => <LoadingIndicator />;

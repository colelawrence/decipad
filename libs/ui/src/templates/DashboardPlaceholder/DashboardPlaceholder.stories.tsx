import { Meta, StoryFn } from '@storybook/react';
import { DashboardPlaceholder } from './DashboardPlaceholder';

export default {
  title: 'Templates / Dashboard / Placeholder',
  component: DashboardPlaceholder,
} as Meta;

export const Normal: StoryFn = () => <DashboardPlaceholder />;

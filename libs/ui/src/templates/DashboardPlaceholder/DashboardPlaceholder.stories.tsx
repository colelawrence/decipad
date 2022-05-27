import { Meta, Story } from '@storybook/react';
import { DashboardPlaceholder } from './DashboardPlaceholder';

export default {
  title: 'Templates / Dashboard / Placeholder',
  component: DashboardPlaceholder,
} as Meta;

export const Normal: Story = () => <DashboardPlaceholder />;

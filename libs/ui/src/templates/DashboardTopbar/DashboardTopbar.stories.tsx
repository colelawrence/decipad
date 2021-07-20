import { Meta, Story } from '@storybook/react';
import { DashboardTopbar } from './DashboardTopbar';

export default {
  title: 'Templates / Dashboard / Topbar',
} as Meta;

export const Normal: Story = () => (
  <DashboardTopbar
    userName="John Doe"
    email="john.doe@example.com"
    numberOfNotebooks={2}
  />
);

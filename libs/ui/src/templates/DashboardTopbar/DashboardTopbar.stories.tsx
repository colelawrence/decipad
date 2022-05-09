import { Meta, Story } from '@storybook/react';
import { DashboardTopbar } from './DashboardTopbar';

export default {
  title: 'Templates / Dashboard / Topbar',
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story = () => (
  <DashboardTopbar
    name="John Doe"
    email="john.doe@example.com"
    numberOfNotebooks={2}
  />
);

import { Meta, Story } from '@storybook/react';
import { Announcement } from './Announcement';

export default {
  title: 'Icons / Announcement',
  component: Announcement,
} as Meta;

export const Normal: Story = () => <Announcement />;

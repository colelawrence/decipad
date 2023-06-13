import { Meta, StoryFn } from '@storybook/react';
import { DashboardTopbar } from './DashboardTopbar';

export default {
  title: 'Templates / Dashboard / Topbar',
} as Meta;

export const Normal: StoryFn = () => <DashboardTopbar />;

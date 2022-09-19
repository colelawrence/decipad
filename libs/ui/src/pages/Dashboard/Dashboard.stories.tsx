import { Meta, Story } from '@storybook/react';
import { Normal as DashboardSidebar } from '../../templates/DashboardSidebar/DashboardSidebar.stories';
import { Normal as DashboardTopbar } from '../../templates/DashboardTopbar/DashboardTopbar.stories';
import { Normal as NotebookList } from '../../templates/NotebookList/NotebookList.stories';
import { Dashboard } from './Dashboard';

export default {
  title: 'Pages / Dashboard',
  component: Dashboard,
} as Meta;

export const Normal: Story = () => (
  <Dashboard
    topbar={<DashboardTopbar />}
    sidebar={<DashboardSidebar />}
    notebookList={<NotebookList numberOfNotebooks={12} />}
  />
);

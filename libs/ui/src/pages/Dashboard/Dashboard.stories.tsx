import { Meta, StoryFn } from '@storybook/react';
import { Normal as DashboardSidebar } from '../../templates/DashboardSidebar/DashboardSidebar.stories';
import { Normal as DashboardTopbar } from '../../templates/DashboardTopbar/DashboardTopbar.stories';
import { Dashboard } from './Dashboard';
import { UINotebookList } from '../../templates';
import { noop } from '@decipad/utils';

export default {
  title: 'Pages / Dashboard',
  component: Dashboard,
} as Meta;

export const Normal: StoryFn = () => (
  <Dashboard
    topbar={<DashboardTopbar />}
    sidebar={<DashboardSidebar />}
    notebookList={
      <UINotebookList onImport={noop} isSearchEmpty={false}>
        Child
      </UINotebookList>
    }
  />
);

import { Meta, StoryFn } from '@storybook/react';
import { Normal as DashboardSidebar } from '../DashboardSidebar/DashboardSidebar.stories';
import { Dashboard } from './Dashboard';
import { UINotebookList } from '../NotebookList/UINotebookList';
import { noop } from '@decipad/utils';

export default {
  title: 'Pages / Dashboard',
  component: Dashboard,
} as Meta;

export const Normal: StoryFn = () => (
  <Dashboard MetaComponent={null} SidebarComponent={<DashboardSidebar />}>
    <UINotebookList onImport={noop} isSearchEmpty={false}>
      Child
    </UINotebookList>
  </Dashboard>
);

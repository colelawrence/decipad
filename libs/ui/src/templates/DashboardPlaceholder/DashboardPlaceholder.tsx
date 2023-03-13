import {
  Dashboard,
  DashboardSidebarPlaceholder,
  DashboardTopbar,
  NotebookListPlaceholder,
} from '@decipad/ui';

export const DashboardPlaceholder: React.FC = () => (
  <Dashboard
    topbar={<DashboardTopbar />}
    sidebar={<DashboardSidebarPlaceholder />}
    notebookList={<NotebookListPlaceholder />}
  />
);

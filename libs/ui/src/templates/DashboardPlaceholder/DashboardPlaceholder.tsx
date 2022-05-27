import {
  Dashboard,
  DashboardTopbar,
  NotebookListPlaceholder,
} from '@decipad/ui';

export const DashboardPlaceholder: React.FC = () => (
  <Dashboard
    topbar={<DashboardTopbar name="" email="" />}
    sidebar={<></>}
    notebookList={<NotebookListPlaceholder />}
  />
);

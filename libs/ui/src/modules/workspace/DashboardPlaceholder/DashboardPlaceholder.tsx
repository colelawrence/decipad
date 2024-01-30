import { DashboardSidebarPlaceholder } from '../DashboardSidebarPlaceholder/DashboardSidebarPlaceholder';
import { Dashboard } from '../Dashboard/Dashboard';
import { DashboardTopbar } from '../DashboardTopbar/DashboardTopbar';
import { NotebookListPlaceholder } from '../NotebookListPlaceholder/NotebookListPlaceholder';

export const DashboardPlaceholder: React.FC = () => (
  <Dashboard
    topbar={<DashboardTopbar />}
    sidebar={<DashboardSidebarPlaceholder />}
    notebookList={<NotebookListPlaceholder />}
  />
);

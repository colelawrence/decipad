import { DashboardTopbar, NotebookListPlaceholder } from '..';
import { DashboardSidebarPlaceholder } from '../../atoms';
import { Dashboard } from '../../pages';

export const DashboardPlaceholder: React.FC = () => (
  <Dashboard
    topbar={<DashboardTopbar />}
    sidebar={<DashboardSidebarPlaceholder />}
    notebookList={<NotebookListPlaceholder />}
  />
);

import { DashboardSidebarPlaceholder } from '../DashboardSidebarPlaceholder/DashboardSidebarPlaceholder';
import { Dashboard } from '../Dashboard/Dashboard';
import { NotebookListPlaceholder } from '../NotebookListPlaceholder/NotebookListPlaceholder';

export const DashboardPlaceholder: React.FC = () => (
  <Dashboard
    MetaComponent={null}
    SidebarComponent={<DashboardSidebarPlaceholder />}
  >
    <NotebookListPlaceholder />
  </Dashboard>
);

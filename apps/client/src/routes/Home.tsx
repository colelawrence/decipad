import { useGetWorkspaces } from '@decipad/queries';
import { LoadingSpinnerPage, DashboardPlaceholder } from '@decipad/ui';
import { FC, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

export function Home(): ReturnType<FC> {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const query = useGetWorkspaces();
  const history = useHistory();
  const isRootPath = history.location.pathname === '/';

  useEffect(() => {
    if (isRootPath && !workspaceId) {
      query.refetch().then((res) => {
        if (res.data.workspaces.length > 0) {
          setWorkspaceId(res.data.workspaces[0].id);
        }
      });
    }
  }, [isRootPath, query, workspaceId]);

  if (workspaceId) {
    return <Redirect to={`/w/${workspaceId}`} />;
  }

  if (isRootPath) {
    return <DashboardPlaceholder />;
  }

  return <LoadingSpinnerPage />;
}

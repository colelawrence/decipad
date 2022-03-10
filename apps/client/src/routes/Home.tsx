import { useGetWorkspaces } from '@decipad/queries';
import { LoadingSpinnerPage } from '@decipad/ui';
import { FC, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

export function Home(): ReturnType<FC> {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const query = useGetWorkspaces();
  const history = useHistory();

  useEffect(() => {
    if (history.location.pathname === '/' && !workspaceId) {
      query.refetch().then((res) => {
        if (res.data.workspaces.length > 0) {
          setWorkspaceId(res.data.workspaces[0].id);
        }
      });
    }
  }, [history, query, workspaceId]);

  if (workspaceId) {
    return <Redirect to={`/w/${workspaceId}`} />;
  }

  return <LoadingSpinnerPage />;
}

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKSPACES, GetWorkspaces } from '@decipad/queries';
import { Redirect, useHistory } from 'react-router-dom';
import { LoadingSpinnerPage } from '@decipad/ui';

export function Home() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const query = useQuery<GetWorkspaces>(GET_WORKSPACES);
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
    return <Redirect to={`/workspaces/${workspaceId}`} />;
  }

  return <LoadingSpinnerPage />;
}

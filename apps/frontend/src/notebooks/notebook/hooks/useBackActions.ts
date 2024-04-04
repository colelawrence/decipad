import type {
  NotebookMetaDataFragment,
  NotebookWorkspacesDataFragment,
} from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type BackAction = (options: {
  workspace: NotebookMetaDataFragment['workspace'];
  userWorkspaces: Array<NotebookWorkspacesDataFragment>;
  isSharedNotebook: boolean;
}) => () => void;

export const useBackActions: BackAction = ({
  workspace,
  userWorkspaces,
  isSharedNotebook,
}) => {
  const navigate = useNavigate();

  return useCallback(() => {
    const redirectToWorkspace =
      workspace && workspace.access
        ? workspaces({}).workspace({
            workspaceId: workspace.id,
          }).$
        : null;

    const hasWorkspaces = userWorkspaces && userWorkspaces.length > 0;
    const redirectToShared =
      isSharedNotebook && hasWorkspaces
        ? workspaces({})
            .workspace({
              workspaceId: userWorkspaces[0].id,
            })
            .shared({}).$
        : null;

    if (redirectToWorkspace) {
      navigate(redirectToWorkspace);
    } else if (redirectToShared) {
      navigate(redirectToShared);
    } else {
      navigate('/w');
    }
  }, [navigate, workspace, userWorkspaces, isSharedNotebook]);
};

import { workspaces } from '@decipad/routing';
import {
  DatabaseConnectionScreen,
  EditDataConnectionsModal as UIEditDataConnectionsModal,
  WorkspaceSecrets,
} from '@decipad/ui';
import { ComponentProps, FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

type EditDataConnectionsModalProps = ComponentProps<
  typeof UIEditDataConnectionsModal
>;

const EditDataConnectionsModal: FC<EditDataConnectionsModalProps> = (props) => {
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId: props.currentWorkspace.id,
  });

  return (
    <Routes>
      <Route path="" element={<UIEditDataConnectionsModal {...props} />}>
        <Route
          path=""
          element={
            <Navigate
              to={currentWorkspaceRoute.connections({}).codeSecrets({}).$}
            />
          }
        />
        <Route
          path={currentWorkspaceRoute.connections({}).codeSecrets.template}
          element={<WorkspaceSecrets workspaceId={props.currentWorkspace.id} />}
        />
        <Route
          path={currentWorkspaceRoute.connections({}).sqlConnections.template}
          element={
            <DatabaseConnectionScreen workspaceId={props.currentWorkspace.id} />
          }
        />
      </Route>
    </Routes>
  );
};

export default EditDataConnectionsModal;

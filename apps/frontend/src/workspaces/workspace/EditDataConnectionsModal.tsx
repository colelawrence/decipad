import { useWorkspaceDatasets } from '@decipad/editor-integrations';
import { isFlagEnabled } from '@decipad/feature-flags';
import { workspaces } from '@decipad/routing';
import {
  DatabaseConnectionScreen,
  Datasets,
  Services,
  EditDataConnectionsModal as UIEditDataConnectionsModal,
  WorkspaceSecrets,
} from '@decipad/ui';
import { Suspense, type ComponentProps, type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

type EditDataConnectionsModalProps = ComponentProps<
  typeof UIEditDataConnectionsModal
>;

const SuspendedDatasets: FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const datasets = useWorkspaceDatasets(workspaceId);

  return <Datasets workspaceId={workspaceId} datasets={datasets} />;
};

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
          path={currentWorkspaceRoute.connections({}).webhooks.template}
          element={
            <WorkspaceSecrets webhook workspaceId={props.currentWorkspace.id} />
          }
        />
        <Route
          path={currentWorkspaceRoute.connections({}).sqlConnections.template}
          element={
            <DatabaseConnectionScreen workspaceId={props.currentWorkspace.id} />
          }
        />
        {isFlagEnabled('NOTION_CONNECTIONS') && (
          <>
            <Route
              path={currentWorkspaceRoute.connections({}).datasets.template}
              element={
                <Suspense>
                  <SuspendedDatasets workspaceId={props.currentWorkspace.id} />
                </Suspense>
              }
            />

            <Route
              path={currentWorkspaceRoute.connections({}).integrations.template}
              element={<Services workspaceId={props.currentWorkspace.id} />}
            />
          </>
        )}
      </Route>
    </Routes>
  );
};

export default EditDataConnectionsModal;

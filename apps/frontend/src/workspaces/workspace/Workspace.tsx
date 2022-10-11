import { useRouteParams, workspaces, notebooks } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  Dashboard,
  DashboardSidebarPlaceholder,
  NotebookListPlaceholder,
  TopbarPlaceholder,
} from '@decipad/ui';
import { sortBy } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import { FC, lazy, useMemo } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { loadNotebooks } from '../../App';
import {
  useCreateNotebookMutation,
  useCreateWorkspaceMutation,
  useDeleteNotebookMutation,
  useDeleteWorkspaceMutation,
  useDuplicateNotebookMutation,
  useGetWorkspacesQuery,
  useImportNotebookMutation,
  useRenameWorkspaceMutation,
} from '../../graphql';
import { ErrorPage, Frame, LazyRoute } from '../../meta';
import { exportNotebook } from '../../utils/exportNotebook';
import { parseIconColorFromIdentifier } from '../../utils/parseIconColorFromIdentifier';

const loadTopbar = () =>
  import(/* webpackChunkName: "workspace-topbar" */ './Topbar');
const Topbar = lazy(loadTopbar);
const loadSidebar = () => import(/* webpackChunkName: "sidebar" */ './Sidebar');
const Sidebar = lazy(loadSidebar);
const loadNotebookList = () =>
  import(/* webpackChunkName: "notebook-list" */ './NotebookList');
const NotebookList = lazy(loadNotebookList);
const loadCreateWorkspaceModal = () =>
  import(
    /* webpackChunkName: "create-workspace-modal" */ './CreateWorkspaceModal'
  );
const CreateWorkspaceModal = lazy(loadCreateWorkspaceModal);
const loadEditWorkspaceModal = () =>
  import(/* webpackChunkName: "edit-workspace-modal" */ './EditWorkspaceModal');
const EditWorkspaceModal = lazy(loadEditWorkspaceModal);

// prefetch
loadTopbar().then(loadNotebookList).then(loadSidebar);

const Workspace: FC = () => {
  const { workspaceId } = useRouteParams(workspaces({}).workspace);
  const navigate = useNavigate();
  const { data: session } = useSession();
  const toast = useToast();
  const [result] = useGetWorkspacesQuery();

  const createNotebook = useCreateNotebookMutation()[1];
  const deleteNotebook = useDeleteNotebookMutation()[1];
  const duplicateNotebook = useDuplicateNotebookMutation()[1];
  const importNotebook = useImportNotebookMutation()[1];
  const createWorkspace = useCreateWorkspaceMutation()[1];
  const renameWorkspace = useRenameWorkspaceMutation()[1];
  const deleteWorkspace = useDeleteWorkspaceMutation()[1];

  const { data: workspaceData } = result;

  const currentWorkspace = useMemo(
    () => workspaceData?.workspaces.find((w) => w.id === workspaceId),
    [workspaceData?.workspaces, workspaceId]
  );
  if (!currentWorkspace || !session) {
    return <ErrorPage Heading="h1" wellKnown="404" />;
  }

  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });

  const allNotebooks = sortBy(
    currentWorkspace?.pads?.items,
    (item) => -Date.parse(item.createdAt)
  ).map((notebook) => {
    const { icon = 'Rocket', iconColor = 'Catskill' } =
      parseIconColorFromIdentifier(notebook?.icon);

    return {
      ...notebook,
      icon,
      iconColor,
      onExport: exportNotebook(notebook.id),
    };
  });

  const allOtherWorkspaces = workspaceData?.workspaces.filter(
    (w) => w.id !== workspaceId
  );

  const handleCreateNotebook = async () => {
    try {
      const { data: createdNotebookData, error } = await createNotebook({
        workspaceId,
        name: '',
      });
      if (error) {
        console.error('Failed to create notebook. Error:', error);
        toast('Failed to create notebook.', 'error');
      } else if (!createdNotebookData) {
        console.error('Failed to create notebook. Received empty response.');
        toast('Failed to create notebook.', 'error');
      } else {
        navigate(
          notebooks({}).notebook({ notebook: createdNotebookData.createPad }).$
        );
      }
    } catch (err) {
      console.error('Failed to create notebook. Error:', err);
      toast('Failed to create notebook.', 'error');
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LazyRoute title={currentWorkspace.name}>
            <Dashboard
              sidebar={
                <Frame
                  Heading="h1"
                  title={null}
                  suspenseFallback={<DashboardSidebarPlaceholder />}
                >
                  <Sidebar
                    Heading="h1"
                    activeWorkspace={{
                      ...currentWorkspace,
                      numberOfMembers: 1,
                    }}
                    otherWorkspaces={
                      allOtherWorkspaces?.map((workspace) => ({
                        ...workspace,
                        href: workspaces({}).workspace({
                          workspaceId: workspace.id,
                        }).$,
                        numberOfMembers: 1,
                      })) ?? []
                    }
                    onCreateWorkspace={() =>
                      navigate(currentWorkspaceRoute.createNew({}).$)
                    }
                    onEditWorkspace={(id) => {
                      navigate(
                        workspaces({}).workspace({ workspaceId: id }).edit({}).$
                      );
                    }}
                    onPointerEnter={() =>
                      loadEditWorkspaceModal().then(loadCreateWorkspaceModal)
                    }
                  />
                </Frame>
              }
              topbar={
                <Frame
                  Heading="h1"
                  title={null}
                  suspenseFallback={<TopbarPlaceholder />}
                >
                  <Topbar
                    name={session.user.name || 'Me'}
                    email={session.user.email || 'me@example.com'}
                    numberOfNotebooks={currentWorkspace.pads.items.length}
                    onCreateNotebook={handleCreateNotebook}
                    onLogout={signOut}
                    onPointerEnter={loadNotebooks}
                  />
                </Frame>
              }
              notebookList={
                <Frame
                  Heading="h1"
                  title={null}
                  suspenseFallback={<NotebookListPlaceholder />}
                >
                  <NotebookList
                    Heading="h1"
                    notebooks={allNotebooks}
                    onCreateNotebook={handleCreateNotebook}
                    onDelete={(id) =>
                      deleteNotebook({ id }).catch((err) => {
                        console.error('Failed to delete notebook. Error:', err);
                        toast('Failed to delete notebook.', 'error');
                      })
                    }
                    onDuplicate={(id) =>
                      duplicateNotebook({
                        id,
                        targetWorkspace: workspaceId,
                      }).catch((err) => {
                        console.error(
                          'Failed to duplicate notebook. Error:',
                          err
                        );
                        toast('Failed to duplicate notebook.', 'error');
                      })
                    }
                    onImport={(source) =>
                      importNotebook({ workspaceId, source }).catch((err) => {
                        console.error('Failed to import notebook. Error:', err);
                        toast('Failed to import notebook.', 'error');
                      })
                    }
                    onPointerEnter={loadNotebooks}
                  />
                </Frame>
              }
            />
            <Outlet />
          </LazyRoute>
        }
      >
        <Route
          path={currentWorkspaceRoute.createNew.template}
          element={
            <CreateWorkspaceModal
              Heading="h2"
              closeHref={currentWorkspaceRoute.$}
              onCreate={(name) => {
                createWorkspace({ name })
                  .then((res) => {
                    if (res.data) {
                      navigate(
                        workspaces({}).workspace({
                          workspaceId: res.data.createWorkspace.id,
                        }).$
                      );
                    } else {
                      console.error(
                        'Failed to create workspace. Received empty response.',
                        res
                      );
                      toast('Failed to create workspace.', 'error');
                    }
                  })
                  .catch((err) => {
                    console.error('Failed to create workspace. Error:', err);
                    toast('Failed to create workspace.', 'error');
                  });
              }}
            />
          }
        />
        <Route
          path={currentWorkspaceRoute.edit.template}
          element={
            <EditWorkspaceModal
              Heading="h1"
              name={currentWorkspace.name}
              allowDelete={
                workspaceData?.workspaces &&
                workspaceData?.workspaces?.length > 1
              }
              closeHref={currentWorkspaceRoute.$}
              onRename={(newName) =>
                renameWorkspace({ id: currentWorkspace.id, name: newName })
                  .then(() => {
                    navigate(currentWorkspaceRoute.$);
                  })
                  .catch((err) => {
                    console.error('Failed to rename workspace. Error:', err);
                    toast('Failed to rename workspace.', 'error');
                  })
              }
              onDelete={() => {
                navigate(workspaces({}).$);
                return deleteWorkspace({ id: currentWorkspace.id })
                  .then(() => {
                    toast('Workspace deleted.', 'success');
                  })
                  .catch((err) => {
                    console.error('Failed to delete workspace. Error:', err);
                    toast('Failed to delete workspace.', 'error');
                  });
              }}
            />
          }
        />
      </Route>
      <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
    </Routes>
  );
};
export default Workspace;

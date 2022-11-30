import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  Dashboard,
  DashboardSidebarPlaceholder,
  NotebookListPlaceholder,
  TopbarPlaceholder,
} from '@decipad/ui';
import { TColorStatus } from 'libs/ui/src/atoms/ColorStatus/ColorStatus';
import { sortBy } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import { FC, lazy, useCallback, useMemo, useState } from 'react';
import {
  matchPath,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
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
  useUpdateNotebookArchiveMutation,
  useUpdateNotebookStatusMutation,
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

const workspaceCtaDismissKey = 'workspace-cta-dismiss';

const Workspace: FC = () => {
  const { workspaceId } = useRouteParams(workspaces({}).workspace);
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });
  const navigate = useNavigate();
  const { '*': maybeWorkspaceFolder } = useParams();
  const { params } = (maybeWorkspaceFolder &&
    matchPath(
      currentWorkspaceRoute.section.templateWithQuery,
      `/${maybeWorkspaceFolder}`
    )) || { params: { sectionId: null } };
  const sectionId = params && params.sectionId;
  const { data: session } = useSession();
  const toast = useToast();

  const [result] = useGetWorkspacesQuery();

  const createNotebook = useCreateNotebookMutation()[1];
  const deleteNotebook = useUpdateNotebookArchiveMutation()[1]; // soft delete
  const finalDeleteNotebook = useDeleteNotebookMutation()[1];
  const duplicateNotebook = useDuplicateNotebookMutation()[1];
  const importNotebook = useImportNotebookMutation()[1];
  const createWorkspace = useCreateWorkspaceMutation()[1];
  const renameWorkspace = useRenameWorkspaceMutation()[1];
  const deleteWorkspace = useDeleteWorkspaceMutation()[1];
  const changeNotebookStatus = useUpdateNotebookStatusMutation()[1];

  const signoutCallback = useCallback(() => {
    // Checklist show is stored in db, no longer needed on logout.
    // Because after any refresh it persists.
    signOut();
  }, []);

  const [ctaDismissed, setCtaDismissed] = useState(
    () => global.localStorage.getItem(workspaceCtaDismissKey) === '1'
  );
  const onCTADismiss = useCallback(() => {
    global.localStorage.setItem(workspaceCtaDismissKey, '1');
    setCtaDismissed(true);
  }, []);

  const { data: workspaceData } = result;

  const currentWorkspace = useMemo(
    () => workspaceData?.workspaces.find((w) => w.id === workspaceId),
    [workspaceData?.workspaces, workspaceId]
  );

  const allNotebooks = useMemo(
    () =>
      sortBy(
        currentWorkspace?.pads?.items,
        (item) => -Date.parse(item.createdAt)
      )
        .filter((notebook) =>
          (maybeWorkspaceFolder || '') === ''
            ? notebook.archived !== true
            : true
        )
        .filter((notebook) =>
          maybeWorkspaceFolder === 'archived'
            ? notebook.archived === true
            : true
        )
        .filter((notebook) =>
          maybeWorkspaceFolder && maybeWorkspaceFolder === 'published'
            ? notebook.isPublic === true
            : true
        )
        .filter((notebook) =>
          maybeWorkspaceFolder && maybeWorkspaceFolder === 'private'
            ? notebook.isPublic !== true
            : true
        )
        .map((notebook) => {
          const { icon = 'Rocket', iconColor = 'Catskill' } =
            parseIconColorFromIdentifier(notebook?.icon);
          const status: string = notebook?.status || 'No Status';
          return {
            ...notebook,
            icon,
            iconColor,
            status: status as TColorStatus,
            onExport: exportNotebook(notebook.id),
            creationDate: new Date(notebook.createdAt),
          };
        })
        .filter((notebook) =>
          sectionId ? notebook.iconColor === sectionId : true
        ),
    [maybeWorkspaceFolder, sectionId, currentWorkspace?.pads?.items]
  );

  if (!currentWorkspace || !session) {
    return <ErrorPage Heading="h1" wellKnown="404" />;
  }

  const handleCreateNotebook = async () => {
    try {
      const { data: createdNotebookData, error } = await createNotebook({
        workspaceId,
        name: 'My notebook title',
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
  const sidebarWrapper = (
    <Frame
      Heading="h1"
      title={null}
      suspenseFallback={<DashboardSidebarPlaceholder />}
    >
      <Sidebar
        Heading="h1"
        name={session.user.name || 'Me'}
        email={session.user.email || 'me@example.com'}
        onLogout={signoutCallback}
        activeWorkspace={{
          ...currentWorkspace,
          numberOfMembers: 1,
        }}
        allWorkspaces={
          workspaceData?.workspaces?.map((workspace) => ({
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
          navigate(workspaces({}).workspace({ workspaceId: id }).edit({}).$);
        }}
        onClickWorkspace={(id) => {
          navigate(workspaces({}).workspace({ workspaceId: id }).$);
        }}
        onPointerEnter={() =>
          loadEditWorkspaceModal().then(loadCreateWorkspaceModal)
        }
      />
    </Frame>
  );

  const topBarWrapper = (
    <Frame Heading="h1" title={null} suspenseFallback={<TopbarPlaceholder />}>
      <Topbar
        numberOfNotebooks={allNotebooks.length}
        onCreateNotebook={handleCreateNotebook}
        onPointerEnter={loadNotebooks}
      />
    </Frame>
  );

  const notebookListWrapper = (
    <Frame
      Heading="h1"
      title={null}
      suspenseFallback={<NotebookListPlaceholder />}
    >
      <NotebookList
        Heading="h1"
        notebooks={allNotebooks}
        archivePage={maybeWorkspaceFolder === 'archived'}
        mainWorkspaceRoute={!maybeWorkspaceFolder}
        onCreateNotebook={handleCreateNotebook}
        onDelete={(id) => {
          const fn =
            maybeWorkspaceFolder === 'archived'
              ? finalDeleteNotebook
              : deleteNotebook;
          return fn({ id }).catch((err) => {
            console.error('Failed to archive notebook. Error:', err);
            toast('Failed to archive notebook.', 'error');
          });
        }}
        onDuplicate={(id) =>
          duplicateNotebook({
            id,
            targetWorkspace: workspaceId,
          }).catch((err) => {
            console.error('Failed to duplicate notebook. Error:', err);
            toast('Failed to duplicate notebook.', 'error');
          })
        }
        onChangeStatus={(id, status: TColorStatus) => {
          changeNotebookStatus({
            id,
            status,
          }).catch((err) => {
            console.error('Failed to change status. Error:', err);
            toast('Failed to change notebook status', 'error');
          });
        }}
        onImport={(source) =>
          importNotebook({ workspaceId, source }).catch((err) => {
            console.error('Failed to import notebook. Error:', err);
            toast('Failed to import notebook.', 'error');
          })
        }
        onCTADismiss={onCTADismiss}
        showCTA={!ctaDismissed}
        onPointerEnter={loadNotebooks}
      />
    </Frame>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LazyRoute title={currentWorkspace.name}>
            <Dashboard
              sidebar={sidebarWrapper}
              topbar={topBarWrapper}
              notebookList={notebookListWrapper}
            />
            <Outlet />
          </LazyRoute>
        }
      >
        <Route path={currentWorkspaceRoute.archived.template} element={<></>} />
        <Route
          path={currentWorkspaceRoute.privateNotebooks.template}
          element={<></>}
        />
        <Route
          path={currentWorkspaceRoute.published.template}
          element={<></>}
        />
        <Route
          path={currentWorkspaceRoute.section.templateWithQuery}
          element={<></>}
        />
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

import {
  useCreateNotebookMutation,
  useCreateSectionMutation,
  useCreateWorkspaceMutation,
  useDeleteSectionMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspacesQuery,
  useImportNotebookMutation,
  useRenameWorkspaceMutation,
  useUpdateSectionMutation,
} from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  CreateWorkspaceModal,
  Dashboard,
  DashboardSidebar,
  DashboardSidebarPlaceholder,
  EditMembersModal,
  EditUserModal,
  EditWorkspaceModal,
  LoadingLogo,
  PaymentSubscriptionStatusModal,
  WorkspaceHero,
} from '@decipad/ui';
import { signOut, useSession } from 'next-auth/react';
import { FC, useCallback, useEffect, useMemo } from 'react';
import {
  Outlet,
  Route,
  Routes,
  matchPath,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useIntercom } from 'react-use-intercom';
import { ErrorPage, Frame, LazyRoute } from '../../meta';
import { useMutationResultHandler } from '../../utils/useMutationResultHandler';
import EditDataConnectionsModal from './EditDataConnectionsModal';
import { NotebookList } from './NotebookList';
import { NotebookMetaActionsProvider } from './providers';

type WorkspaceProps = {
  readonly isRedirectFromStripe?: boolean;
};

const Workspace: FC<WorkspaceProps> = ({ isRedirectFromStripe }) => {
  const { show, showNewMessage } = useIntercom();
  const { setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();

  const showFeedback = useCallback(() => {
    show();
    showNewMessage();
  }, [show, showNewMessage]);

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
  const sectionId = params?.sectionId;
  const isArchivePage = maybeWorkspaceFolder === 'archived';
  const isSharedPage = maybeWorkspaceFolder === 'shared';

  const { data: session } = useSession();
  const toast = useToast();

  const [result] = useGetWorkspacesQuery({
    requestPolicy: 'cache-first',
  });

  const createNotebook = useMutationResultHandler(
    useCreateNotebookMutation()[1],
    'Failed to create notebook'
  );
  const importNotebook = useMutationResultHandler(
    useImportNotebookMutation()[1],
    'Failed to import notebook.'
  );
  const createWorkspace = useMutationResultHandler(
    useCreateWorkspaceMutation()[1],
    'Failed to create workspace'
  );
  const renameWorkspace = useMutationResultHandler(
    useRenameWorkspaceMutation()[1],
    'Failed to rename workspace'
  );
  const deleteWorkspace = useMutationResultHandler(
    useDeleteWorkspaceMutation()[1],
    'Failed to remove workspace'
  );
  const createSection = useMutationResultHandler(
    useCreateSectionMutation()[1],
    'Failed to create section'
  );
  const deleteSection = useMutationResultHandler(
    useDeleteSectionMutation()[1],
    'Failed to remove section'
  );
  const editSection = useMutationResultHandler(
    useUpdateSectionMutation()[1],
    'Failed to save section'
  );

  const signoutCallback = useCallback(() => {
    // Checklist show is stored in db, no longer needed on logout.
    // Because after any refresh it persists.

    signOut({ redirect: false }).then(() => {
      window.location.pathname = '/';
    });
  }, []);

  const { data: workspaceData, fetching: isFetching } = result;
  const fetching = isFetching || !workspaceData;

  const allWorkspaces = useMemo(
    () =>
      workspaceData?.workspaces?.map((workspace) => ({
        ...workspace,
        href: workspaces({}).workspace({
          workspaceId: workspace.id,
        }).$,
      })) ?? [],
    [workspaceData?.workspaces]
  );

  const currentWorkspace = useMemo(
    () => allWorkspaces.find((w) => w.id === workspaceId),
    [allWorkspaces, workspaceId]
  );

  useEffect(() => {
    setCurrentWorkspaceInfo({
      id: currentWorkspace?.id,
      isPremium: !!currentWorkspace?.isPremium,
      quotaLimit: currentWorkspace?.workspaceExecutedQuery?.quotaLimit,
      queryCount: currentWorkspace?.workspaceExecutedQuery?.queryCount,
    });
  }, [currentWorkspace, setCurrentWorkspaceInfo]);

  const pageInfo = useMemo(() => {
    if (isArchivePage) return 'archived';
    if (isSharedPage) return 'shared';

    return sectionId ? 'section' : 'workspace';
  }, [isArchivePage, isSharedPage, sectionId]);

  const paymentStatus = useMemo(
    () => currentWorkspace?.workspaceSubscription?.paymentStatus,
    [currentWorkspace?.workspaceSubscription?.paymentStatus]
  );

  if (fetching) {
    return <LoadingLogo />;
  }

  if (!currentWorkspace || !session) {
    return <ErrorPage Heading="h1" wellKnown="404" />;
  }

  const handleCreateNotebook = async () => {
    const args = {
      workspaceId,
      sectionId,
      name: 'Welcome to Decipad!',
    };

    const createdNotebookData = await createNotebook(args);
    if (createdNotebookData != null) {
      navigate(
        notebooks({}).notebook({
          notebook: createdNotebookData.createPad,
        }).$
      );
    }
  };
  const sidebarWrapper = (
    <Frame
      Heading="h1"
      title={null}
      suspenseFallback={<DashboardSidebarPlaceholder />}
    >
      <DashboardSidebar
        showFeedback={showFeedback}
        Heading="h1"
        name={session?.user?.name || 'Me'}
        email={session.user?.email || 'me@example.com'}
        onLogout={signoutCallback}
        activeWorkspace={currentWorkspace}
        allWorkspaces={allWorkspaces}
        onCreateWorkspace={() =>
          navigate(currentWorkspaceRoute.createNew({}).$)
        }
        onClickWorkspace={(id) => {
          navigate(workspaces({}).workspace({ workspaceId: id }).$);
        }}
        onCreateSection={createSection}
        onUpdateSection={editSection}
        onDeleteSection={(sId: string) => {
          deleteSection({
            workspaceId,
            sectionId: sId,
          })
            .then((res) => {
              if (res) {
                toast('Section removed', 'success');
              }
            })
            .catch((err) => {
              console.error('Failed to remove section. Error:', err);
              toast('Failed to remove section.', 'error');
            });
        }}
      />
    </Frame>
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LazyRoute title={currentWorkspace.name}>
              <NotebookMetaActionsProvider
                workspaceId={currentWorkspace.id}
                isInArchive={pageInfo === 'archived'}
              >
                <Dashboard
                  sidebar={sidebarWrapper}
                  topbar={null}
                  notebookList={
                    <>
                      <WorkspaceHero
                        name={currentWorkspace.name}
                        isPremium={!!currentWorkspace.isPremium}
                        membersCount={currentWorkspace.membersCount}
                        onCreateNotebook={handleCreateNotebook}
                        membersHref={currentWorkspaceRoute.members({}).$}
                      />
                      <NotebookList
                        pageType={pageInfo}
                        notebooks={currentWorkspace.pads.items}
                        sharedNotebooks={workspaceData.padsSharedWithMe.items}
                        workspaces={allWorkspaces}
                        onImport={(source) =>
                          importNotebook({
                            workspaceId: currentWorkspace.id,
                            source,
                          })
                        }
                      />
                    </>
                  }
                />
                <Outlet />
              </NotebookMetaActionsProvider>
            </LazyRoute>
          }
        >
          <Route
            path={currentWorkspaceRoute.section.templateWithQuery}
            element={<></>}
          />
          <Route
            path={currentWorkspaceRoute.archived.template}
            element={<></>}
          />
          <Route path={currentWorkspaceRoute.shared.template} element={<></>} />
          <Route
            path={currentWorkspaceRoute.createNew.template}
            element={
              <LazyRoute>
                <CreateWorkspaceModal
                  Heading="h2"
                  closeHref={currentWorkspaceRoute.$}
                  onCreate={async (workspaceName) => {
                    const data = await createWorkspace({ name: workspaceName });
                    if (data) {
                      navigate(
                        workspaces({}).workspace({
                          workspaceId: data.createWorkspace.id,
                        }).$
                      );
                    }
                  }}
                />
              </LazyRoute>
            }
          />
          <Route
            path={currentWorkspaceRoute.edit.template}
            element={
              <LazyRoute>
                <EditWorkspaceModal
                  Heading="h1"
                  name={currentWorkspace.name}
                  allowDelete={
                    workspaceData?.workspaces &&
                    workspaceData?.workspaces?.length > 1
                  }
                  closeHref={currentWorkspaceRoute.$}
                  membersHref={currentWorkspaceRoute.members({}).$}
                  onRename={async (newName) => {
                    const success = await renameWorkspace({
                      id: currentWorkspace.id,
                      name: newName,
                    });
                    if (success) {
                      navigate(currentWorkspaceRoute.$);
                    }
                  }}
                  onDelete={async () => {
                    navigate(workspaces({}).$);
                    const success = await deleteWorkspace({
                      id: currentWorkspace.id,
                    });
                    if (success) {
                      toast('Workspace deleted.', 'success');
                      navigate('/');
                    }
                  }}
                />
              </LazyRoute>
            }
          />
          <Route
            path={currentWorkspaceRoute.members.template}
            element={
              <LazyRoute>
                <EditMembersModal
                  Heading="h1"
                  closeHref={currentWorkspaceRoute.$}
                  currentWorkspace={currentWorkspace}
                />
              </LazyRoute>
            }
          />
          <Route
            path={`${currentWorkspaceRoute.connections.template}/*`}
            element={
              <LazyRoute>
                <EditDataConnectionsModal
                  Heading="h1"
                  closeHref={currentWorkspaceRoute.$}
                  currentWorkspace={currentWorkspace}
                />
              </LazyRoute>
            }
          />
        </Route>
        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>
      <LazyRoute>
        <EditUserModal />
      </LazyRoute>
      {isRedirectFromStripe && (
        <LazyRoute>
          <PaymentSubscriptionStatusModal
            paymentSubscriptionStatus={paymentStatus || ''}
            templatesHref={'https://www.decipad.com/templates'}
          />
        </LazyRoute>
      )}
    </>
  );
};

export default Workspace;

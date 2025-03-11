import {
  SubscriptionPlan,
  useCreateNotebookMutation,
  useCreateSectionMutation,
  useCreateWorkspaceMutation,
  useDeleteSectionMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspacesWithSharedNotebooksQuery,
  useImportNotebookMutation,
  useRenameWorkspaceMutation,
  useUpdateSectionMutation,
} from '@decipad/graphql-client';
import {
  useCurrentWorkspaceStore,
  useNotebookMetaData,
  useResourceUsage,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  AddCreditsModal,
  CreateWorkspaceModal,
  Dashboard,
  DashboardSidebar,
  DashboardSidebarPlaceholder,
  EditMembersModal,
  EditUserModal,
  EditWorkspaceModal,
  LoadingLogo,
  NotebookListPlaceholder,
  PaywallModal,
  WorkspaceHero,
} from '@decipad/ui';
import { useIntercom } from '@decipad/react-utils';
import { signOut, useSession } from 'next-auth/react';
import { FC, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Outlet,
  Route,
  Routes,
  matchPath,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ErrorPage,
  Frame,
  LazyRoute,
  RequireFreePlanSlotRoute,
  RequirePaidPlanRoute,
} from '../../meta';
import { useMutationResultHandler } from '../../utils/useMutationResultHandler';
import EditDataConnectionsModal from './EditDataConnectionsModal';
import { initNewDocument } from '@decipad/docsync';
import { isFlagEnabled } from '@decipad/feature-flags';
import { NotebookList } from './NotebookList';
import { useInitializeResourceUsage } from '../../hooks';
import { DataLakeModal } from './datalake/DataLakeModal';
import { NewDataLakeConnectionModal } from './datalake/NewDataLakeConnectionModal';
import { EditDataLakeConnectionModal } from './datalake/EditDataLakeConnectionModal';
import { analytics } from '@decipad/client-events';

const Workspace: FC = () => {
  const { show, showNewMessage } = useIntercom();

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

  useEffect(() => {
    if (session == null || session.user == null) {
      return;
    }

    analytics.identify(session.user.id, {
      email: session.user.email!,
      workspaceId,
    });
  }, [session, workspaceId]);

  const { setIsUpgradeWorkspaceModalOpen, isUpgradeWorkspaceModalOpen } =
    useCurrentWorkspaceStore();

  const [result] = useGetWorkspacesWithSharedNotebooksQuery();

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

  const currentSubscriptionPlan = useMemo(() => {
    return {
      ...currentWorkspace?.workspaceSubscription,
      key: currentWorkspace?.workspaceSubscription?.id,
    };
  }, [currentWorkspace]);

  const hasFreeWorkspaceSlot = useMemo(
    () => allWorkspaces.filter((w) => !w.isPremium).length < 1,
    [allWorkspaces]
  );
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false);

  useInitializeResourceUsage(currentWorkspace);

  const { ai } = useResourceUsage();

  const pageInfo = useMemo(() => {
    if (isArchivePage) return 'archived';
    if (isSharedPage) return 'shared';

    return sectionId ? 'section' : 'workspace';
  }, [isArchivePage, isSharedPage, sectionId]);

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
    if (createdNotebookData == null) return;

    try {
      const initResult = await initNewDocument(
        createdNotebookData.createPad.id
      );

      const { sidebarComponent, toggleSidebar } =
        useNotebookMetaData.getState();
      if (sidebarComponent.type !== 'default-sidebar') {
        toggleSidebar({ type: 'default-sidebar' });
      }

      navigate(
        notebooks({}).notebook({
          notebook: initResult,
          tab: initResult.tabId,
        }).$
      );
    } catch (e) {
      console.error(e);
      toast('Failed to create new notebook', 'error');
    }
  };
  const sidebarWrapper = (
    <Frame
      Heading="h1"
      title={null}
      suspenseFallback={<DashboardSidebarPlaceholder />}
    >
      <DashboardSidebar
        name={session?.user?.name}
        email={session.user?.email}
        workspaces={allWorkspaces}
        onCreateWorkspace={() => {
          if (!isFlagEnabled('ALLOW_CREATE_NEW_WORKSPACE')) {
            setIsCreatingNewWorkspace(true);
            setIsUpgradeWorkspaceModalOpen(true);
            return;
          }

          navigate(currentWorkspaceRoute.createNew({}).$);
        }}
        onNavigateWorkspace={(id) => {
          navigate(workspaces({}).workspace({ workspaceId: id }).$);
        }}
        onCreateSection={createSection}
        onUpdateSection={editSection}
        onDeleteSection={(id: string) => {
          deleteSection({
            workspaceId,
            sectionId: id,
          })
            .then((res) => {
              if (res) {
                toast.success('Deleted folder');
              }
            })
            .catch((err) => {
              console.error('Failed to remove folder. Error:', err);
              toast.error('Failed to remove folder.');
            });
        }}
        onShowFeedback={showFeedback}
        onLogout={signoutCallback}
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
              <Dashboard SidebarComponent={sidebarWrapper} MetaComponent={null}>
                <>
                  <WorkspaceHero
                    name={currentWorkspace.name}
                    isPremium={!!currentWorkspace.isPremium}
                    planName={currentSubscriptionPlan?.id ?? ''}
                    membersCount={currentWorkspace.membersCount ?? 1}
                    onCreateNotebook={handleCreateNotebook}
                    aiCreditsLeft={ai.quotaLimit - ai.usage}
                    hasReachedAiLimit={ai.hasReachedLimit}
                    membersHref={currentWorkspaceRoute.members({}).$}
                    creditsHref={currentWorkspaceRoute.addcredits({}).$}
                    permissionType={currentWorkspace.myPermissionType}
                  />
                  <Frame
                    Heading="h1"
                    title={null}
                    suspenseFallback={<NotebookListPlaceholder />}
                  >
                    <NotebookList
                      pageType={pageInfo}
                      sharedNotebooks={workspaceData.padsSharedWithMe.items}
                      workspaces={allWorkspaces}
                      sections={currentWorkspace.sections}
                      onImport={(source) =>
                        importNotebook({
                          workspaceId: currentWorkspace.id,
                          source,
                        })
                      }
                      workspaceId={currentWorkspace.id}
                    />
                  </Frame>
                  <Suspense>
                    {isUpgradeWorkspaceModalOpen && (
                      <PaywallModal
                        onClose={() => setIsUpgradeWorkspaceModalOpen(false)}
                        workspaceId={currentWorkspace.id ?? ''}
                        hasFreeWorkspaceSlot={hasFreeWorkspaceSlot}
                        currentPlan={currentWorkspace.plan ?? undefined}
                        isCreatingNewWorkspace={isCreatingNewWorkspace}
                      />
                    )}
                  </Suspense>
                </>
              </Dashboard>
              <Outlet />
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
              <RequireFreePlanSlotRoute
                hasFreeWorkspaceSlot={hasFreeWorkspaceSlot}
              >
                <LazyRoute>
                  <CreateWorkspaceModal
                    onClose={() => navigate(currentWorkspaceRoute.$)}
                    onCreate={async (workspaceName) => {
                      const data = await createWorkspace({
                        name: workspaceName,
                      });
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
              </RequireFreePlanSlotRoute>
            }
          />
          <Route
            path={currentWorkspaceRoute.edit.template}
            element={
              <LazyRoute>
                <EditWorkspaceModal
                  name={currentWorkspace.name}
                  allowDelete={
                    workspaceData?.workspaces &&
                    workspaceData?.workspaces?.length > 1
                  }
                  onClose={() => navigate(currentWorkspaceRoute.$)}
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
              <RequirePaidPlanRoute isPaidPlan={!!currentWorkspace.isPremium}>
                <LazyRoute>
                  <EditMembersModal
                    onClose={() => navigate(currentWorkspaceRoute.$)}
                    currentWorkspace={currentWorkspace}
                    currentSubscriptionPlan={
                      currentSubscriptionPlan as SubscriptionPlan
                    }
                  />
                </LazyRoute>
              </RequirePaidPlanRoute>
            }
          />
          <Route
            path={`${currentWorkspaceRoute.connections.template}/*`}
            element={
              <LazyRoute>
                <EditDataConnectionsModal
                  onClose={() => navigate(currentWorkspaceRoute.$)}
                  currentWorkspace={currentWorkspace}
                />
              </LazyRoute>
            }
          />

          <Route
            path={currentWorkspaceRoute.addcredits.template}
            element={
              <LazyRoute>
                <AddCreditsModal
                  closeAction={() => navigate(currentWorkspaceRoute.$)}
                  resourceId={currentWorkspace.id}
                ></AddCreditsModal>
              </LazyRoute>
            }
          />

          <Route
            path={`${currentWorkspaceRoute.dataLake.template}/${
              currentWorkspaceRoute.dataLake({}).newConnection.template
            }`}
            element={
              <LazyRoute>
                <NewDataLakeConnectionModal
                  closeAction={() =>
                    navigate(currentWorkspaceRoute.dataLake({}).$)
                  }
                  workspaceId={currentWorkspace.id}
                  createdNewConnectionAction={async () => {
                    // eslint-disable-next-line no-console
                    console.log('createdNewConnectionAction');
                    navigate(currentWorkspaceRoute.dataLake({}).$);
                  }}
                />
              </LazyRoute>
            }
          />

          <Route
            path={`${currentWorkspaceRoute.dataLake.template}/${
              currentWorkspaceRoute.dataLake({}).editConnection.template
            }`}
            element={
              <LazyRoute>
                <EditDataLakeConnectionModal
                  closeAction={() =>
                    navigate(currentWorkspaceRoute.dataLake({}).$)
                  }
                  workspaceId={currentWorkspace.id}
                  editedConnectionAction={async () => {
                    // eslint-disable-next-line no-console
                    console.log('editedConnectionAction');
                    navigate(currentWorkspaceRoute.dataLake({}).$);
                  }}
                />
              </LazyRoute>
            }
          />

          <Route
            path={currentWorkspaceRoute.dataLake.template}
            element={
              <LazyRoute>
                <DataLakeModal
                  closeAction={() => navigate(currentWorkspaceRoute.$)}
                  workspaceId={currentWorkspace.id}
                  newConnectionAction={async (connType: string) =>
                    navigate(
                      currentWorkspaceRoute
                        .dataLake({})
                        .newConnection({ connType }).$
                    )
                  }
                  editConnectionAction={async (connection: string) =>
                    navigate(
                      currentWorkspaceRoute
                        .dataLake({})
                        .editConnection({ connType: connection }).$
                    )
                  }
                />
              </LazyRoute>
            }
          ></Route>
        </Route>

        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>
      <LazyRoute>
        <EditUserModal />
      </LazyRoute>
    </>
  );
};

export default Workspace;

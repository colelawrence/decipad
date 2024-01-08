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
import { useAiUsage, useCurrentWorkspaceStore } from '@decipad/react-contexts';
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
  PaymentSubscriptionStatusModal,
  WorkspaceHero,
} from '@decipad/ui';
import { useIntercom } from '@decipad/react-utils';
import { signOut, useSession } from 'next-auth/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Outlet,
  Route,
  Routes,
  matchPath,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ErrorPage, Frame, LazyRoute } from '../../meta';
import { useMutationResultHandler } from '../../utils/useMutationResultHandler';
import EditDataConnectionsModal from './EditDataConnectionsModal';
import { NotebookList } from './NotebookList';
import { initNewDocument } from '@decipad/docsync';

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

  const [result] = useGetWorkspacesQuery();

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

  const {
    updateUsage,
    promptTokensUsed,
    tokensQuotaLimit,
    completionTokensUsed,
  } = useAiUsage();

  // hack to check if the workspace Id has changed
  const [prevWorkspaceId, setPrevWorkspaceId] = useState(currentWorkspace?.id);

  useEffect(() => {
    let quotaLimit = currentWorkspace?.isPremium
      ? Number(process.env.REACT_APP_MAX_CREDITS_PRO)
      : Number(process.env.REACT_APP_MAX_CREDITS_FREE);
    let pTokens = 0;
    let cTokens = 0;
    (currentWorkspace?.resourceUsages || [])
      .filter((u) => u?.resourceType === 'openai')
      .forEach((u) => {
        if (u?.id.includes('prompt')) {
          pTokens = u.consumption;
        }

        if (u?.id.includes('completion')) {
          cTokens = u.consumption;
        }

        if (u?.quotaLimit) {
          quotaLimit = u.quotaLimit;
        }
      });

    /* we only want to update the usage with the DB values when the user refreshes the page OR
     * if the workspace Id has changed
     */
    if (
      (!promptTokensUsed && !completionTokensUsed && !tokensQuotaLimit) ||
      prevWorkspaceId !== currentWorkspace?.id
    ) {
      updateUsage({
        promptTokensUsed: pTokens,
        completionTokensUsed: cTokens,
        tokensQuotaLimit: quotaLimit,
      });
      setPrevWorkspaceId(currentWorkspace?.id);
    }
  }, [
    updateUsage,
    currentWorkspace?.isPremium,
    currentWorkspace?.resourceUsages,
    promptTokensUsed,
    completionTokensUsed,
    tokensQuotaLimit,
    currentWorkspace?.id,
    prevWorkspaceId,
  ]);

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
    if (createdNotebookData == null) return;

    try {
      await initNewDocument(createdNotebookData.createPad.id);
      navigate(
        notebooks({}).notebook({
          notebook: createdNotebookData.createPad,
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
              <Dashboard
                sidebar={sidebarWrapper}
                topbar={null}
                notebookList={
                  <>
                    <WorkspaceHero
                      name={currentWorkspace.name}
                      isPremium={!!currentWorkspace.isPremium}
                      membersCount={currentWorkspace.membersCount ?? 1}
                      onCreateNotebook={handleCreateNotebook}
                      membersHref={currentWorkspaceRoute.members({}).$}
                      creditsHref={currentWorkspaceRoute.addcredits({}).$}
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
                      workspaceId={currentWorkspace.id}
                    />
                  </>
                }
              />
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

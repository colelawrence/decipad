import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  Dashboard,
  DashboardSidebarPlaceholder,
  NotebookListItem,
  NotebookListPlaceholder,
  TColorKeys,
  TColorStatus,
  TopbarPlaceholder,
} from '@decipad/ui';
import { sortBy } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import {
  ComponentProps,
  FC,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  matchPath,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useIntercom } from 'react-use-intercom';
import {
  useCreateNotebookMutation,
  useCreateSectionMutation,
  useCreateWorkspaceMutation,
  useDeleteNotebookMutation,
  useDeleteSectionMutation,
  useDeleteWorkspaceMutation,
  useDuplicateNotebookMutation,
  useGetWorkspacesQuery,
  useImportNotebookMutation,
  useMoveNotebookMutation,
  useRenameWorkspaceMutation,
  useSetUsernameMutation,
  useUnarchiveNotebookMutation,
  useUpdateNotebookArchiveMutation,
  useUpdateNotebookStatusMutation,
  useUpdateSectionAddNotebookMutation,
  useUpdateSectionMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../graphql';
import { ErrorPage, Frame, LazyRoute } from '../../meta';
import { filterPads, makeIcons, workspaceCtaDismissKey } from '../../utils';
import { useMutationResultHandler } from '../../utils/useMutationResultHandler';

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
const loadEditUserModal = () =>
  import(/* webpackChunkName: "edit-user-modal" */ './EditUserModal');
const EditUserModal = lazy(loadEditUserModal);

export const loadNotebooks = () =>
  import(/* webpackChunkName: "notebooks" */ '../../notebooks/Notebooks');

// prefetch
loadTopbar().then(loadNotebookList).then(loadSidebar);

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
  const { data: user } = useUserQuery()[0];

  const toast = useToast();

  const [userSettings, setUserSettings] = useState(false);

  const [name, setName] = useState(user?.self?.name || '');
  const [username, setUsername] = useState(user?.self?.username || '');
  const [description, setDescription] = useState(user?.self?.description || '');
  const [result, refetch] = useGetWorkspacesQuery({
    requestPolicy: 'network-only',
  });

  const createNotebook = useMutationResultHandler(
    useCreateNotebookMutation()[1],
    'Failed to create notebook'
  );
  const deleteNotebook = useMutationResultHandler(
    useUpdateNotebookArchiveMutation()[1],
    'Failed to remove notebook'
  ); // soft delete
  const finalDeleteNotebook = useMutationResultHandler(
    useDeleteNotebookMutation()[1],
    'Failed to remove notebook'
  );
  const duplicateNotebook = useMutationResultHandler(
    useDuplicateNotebookMutation()[1],
    'Failed to duplicate notebook'
  );
  const moveNotebook = useMutationResultHandler(
    useMoveNotebookMutation()[1],
    'Failed to move notebook to workspace.'
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
  const changeNotebookStatus = useMutationResultHandler(
    useUpdateNotebookStatusMutation()[1]
  );
  const updateUser = useMutationResultHandler(
    useUpdateUserMutation()[1],
    'Failed to save user'
  );
  const setUsernameMutation = useMutationResultHandler(
    useSetUsernameMutation()[1],
    'Could not change your username'
  );
  const unarchiveNotebook = useMutationResultHandler(
    useUnarchiveNotebookMutation()[1]
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
  const movePadToSection = useMutationResultHandler(
    useUpdateSectionAddNotebookMutation()[1],
    'Failed to move notebook to section'
  );

  const signoutCallback = useCallback(() => {
    // Checklist show is stored in db, no longer needed on logout.
    // Because after any refresh it persists.

    signOut({ redirect: false }).then(() => {
      window.location.pathname = '/';
    });
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

  const pageInfo: ComponentProps<typeof NotebookListItem>['page'] =
    useMemo(() => {
      const sections = currentWorkspace?.sections || [];

      if (isArchivePage) return { type: 'archived', sections };
      if (isSharedPage) return { type: 'shared', sections };

      return {
        type: sectionId ? 'section' : 'workspace',
        sections,
      };
    }, [isArchivePage, isSharedPage, sectionId, currentWorkspace]);

  const filterNotebooks = useMemo(() => {
    return filterPads({ page: pageInfo.type });
  }, [pageInfo]);

  useEffect(() => {
    if (!isSharedPage) return;

    refetch();
  }, [refetch, isSharedPage]);

  const allSectionNotebooks = useMemo(
    () =>
      currentWorkspace?.sections
        .find((sct) => sct.id === sectionId)
        ?.pads?.filter(filterNotebooks)
        .map(makeIcons),
    [currentWorkspace?.sections, filterNotebooks, sectionId]
  );

  const allNotebooks = useMemo(
    () =>
      sortBy(
        currentWorkspace?.pads?.items,
        (item) => -Date.parse(item.createdAt)
      )
        .filter(filterNotebooks)
        .map(makeIcons),
    [currentWorkspace?.pads?.items, filterNotebooks]
  );

  const sharedNotebooks = useMemo(
    () =>
      sortBy(
        workspaceData?.padsSharedWithMe?.items,
        (item) => -Date.parse(item.createdAt)
      ).map(makeIcons),
    [workspaceData?.padsSharedWithMe?.items]
  );

  const showNotebooks = useMemo(
    () =>
      isSharedPage
        ? sharedNotebooks
        : sectionId
        ? allSectionNotebooks && allSectionNotebooks.length > 0
          ? allSectionNotebooks
          : []
        : allNotebooks,
    [
      allNotebooks,
      allSectionNotebooks,
      sharedNotebooks,
      isSharedPage,
      sectionId,
    ]
  );

  if (!currentWorkspace || !session) {
    return <ErrorPage Heading="h1" wellKnown="404" />;
  }

  const handleCreateNotebook = async () => {
    const args = {
      workspaceId,
      sectionId,
      name: 'My notebook title',
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

  const allWorkspaces =
    workspaceData?.workspaces?.map((workspace) => ({
      ...workspace,
      href: workspaces({}).workspace({
        workspaceId: workspace.id,
      }).$,
      numberOfMembers: 1,
    })) ?? [];

  const sidebarWrapper = (
    <Frame
      Heading="h1"
      title={null}
      suspenseFallback={<DashboardSidebarPlaceholder />}
    >
      <Sidebar
        showFeedback={showFeedback}
        Heading="h1"
        name={user?.self?.name || 'Me'}
        email={session.user.email || 'me@example.com'}
        onLogout={signoutCallback}
        activeWorkspace={{
          ...currentWorkspace,
          numberOfMembers: 1,
        }}
        allWorkspaces={allWorkspaces}
        onCreateWorkspace={() =>
          navigate(currentWorkspaceRoute.createNew({}).$)
        }
        onEditWorkspace={(id) => {
          navigate(workspaces({}).workspace({ workspaceId: id }).edit({}).$);
        }}
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
        onPointerEnter={() =>
          loadEditWorkspaceModal().then(loadCreateWorkspaceModal)
        }
        onOpenSettings={setUserSettings}
      />
    </Frame>
  );

  const topBarWrapper = (
    <Frame Heading="h1" title={null} suspenseFallback={<TopbarPlaceholder />}>
      <Topbar
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
        notebooks={showNotebooks}
        page={pageInfo}
        mainWorkspaceRoute={!maybeWorkspaceFolder}
        onCreateNotebook={handleCreateNotebook}
        otherWorkspaces={allWorkspaces.filter(
          (workspace) => workspace.id !== currentWorkspace.id
        )}
        onMoveToSection={(pId, sId) => {
          return movePadToSection({ sectionId: sId, notebookId: pId }).catch(
            (err) => {
              console.error(`Failed to add notebook to section. Error:`, err);
              toast('Failed to add notebook to section', 'error');
            }
          );
        }}
        onDelete={(id) => {
          const fn =
            pageInfo.type === 'archived' ? finalDeleteNotebook : deleteNotebook;
          return fn({ id }).catch((err) => {
            console.error(
              `Failed to ${
                pageInfo.type === 'archived' ? 'delete' : 'archive'
              } notebook. Error:`,
              err
            );
            toast(
              `Failed to ${
                pageInfo.type === 'archived' ? 'delete' : 'archive'
              } notebook`,
              'error'
            );
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
        onMoveToWorkspace={async (id, targetWorkspaceId) => {
          await moveNotebook({ id, workspaceId: targetWorkspaceId });
        }}
        onChangeStatus={(id, st: TColorStatus) => {
          if (TColorKeys.includes(st)) {
            changeNotebookStatus({
              id,
              status: st,
            }).catch((err) => {
              console.error('Failed to change status. Error:', err);
              toast('Failed to change notebook status', 'error');
            });
          } else {
            console.error(
              `Bad status. Error: ${st} is not valid ${JSON.stringify(
                TColorKeys,
                null,
                2
              )}`
            );
            toast('Failed to change notebook status', 'error');
          }
        }}
        onImport={(source) =>
          importNotebook({ workspaceId, source }).catch((err) => {
            console.error('Failed to import notebook. Error:', err);
            toast('Failed to import notebook.', 'error');
          })
        }
        onUnarchive={(id: string) =>
          unarchiveNotebook({
            id,
          }).catch((err) => {
            console.error('Failed to un-archive notebook. Error:', err);
            toast('Failed to move notebook to all notebooks.', 'error');
          })
        }
        onCTADismiss={onCTADismiss}
        showCTA={!ctaDismissed}
        onPointerEnter={loadNotebooks}
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
                topbar={topBarWrapper}
                notebookList={notebookListWrapper}
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
            }
          />
        </Route>
        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>
      <div style={{ display: userSettings ? 'block' : 'none' }}>
        <EditUserModal
          name={name}
          username={username}
          description={description}
          // closeHref={currentWorkspaceRoute.$}
          onClose={() => setUserSettings(false)}
          onChangeName={(newName) => {
            setName(newName);
            updateUser({
              props: {
                name: newName,
              },
            }).catch((err) => {
              console.error('Failed to update user. Error:', err);
              toast('Could not change your name', 'error');
            });
          }}
          onChangeUsername={async (newUsername) => {
            const data = await setUsernameMutation({
              props: {
                username: newUsername,
              },
            });
            if (data) {
              const { setUsername: usenameChangeSuccessful } = data;
              if (usenameChangeSuccessful) {
                toast(`You are now ${newUsername}`, 'success');
                setUsername(newUsername);
              } else {
                toast(`Username ${newUsername} is already taken`, 'error');
              }
            }
          }}
          onChangeDescription={async (newDescription) => {
            const data = await updateUser({
              props: {
                description: newDescription,
              },
            });
            if (data) {
              setDescription(newDescription);
            }
          }}
        />
      </div>
    </>
  );
};
export default Workspace;

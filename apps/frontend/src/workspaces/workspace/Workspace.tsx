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
import { loadNotebooks } from '../../App';
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
  useRenameWorkspaceMutation,
  useSetUsernameMutation,
  useUnarchiveNotebookMutation,
  useUpdateNotebookArchiveMutation,
  useUpdateNotebookStatusMutation,
  useUpdateSectionAddNotebookMutation,
  useUpdateSectionMutation,
  useUpdateUserMutation,
} from '../../graphql';
import { ErrorPage, Frame, LazyRoute } from '../../meta';
import { filterPads, makeIcons, workspaceCtaDismissKey } from '../../utils';

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

// prefetch
loadTopbar().then(loadNotebookList).then(loadSidebar);

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
  const sectionId = params?.sectionId;
  const isArchivePage = maybeWorkspaceFolder === 'archived';
  const { data: session } = useSession();
  const toast = useToast();

  const [userSettings, setUserSettings] = useState(false);

  const [name, setName] = useState(session?.user.name || '');
  const [username, setUsername] = useState(session?.user.username || '');
  const [description, setDescription] = useState(
    session?.user.description || ''
  );
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
  const updateUser = useUpdateUserMutation()[1];
  const setUsernameMutation = useSetUsernameMutation()[1];
  const unarchiveNotebook = useUnarchiveNotebookMutation()[1];
  const createSection = useCreateSectionMutation()[1];
  const deleteSection = useDeleteSectionMutation()[1];
  const editSection = useUpdateSectionMutation()[1];
  const movePadToSection = useUpdateSectionAddNotebookMutation()[1];

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
      return {
        type: isArchivePage ? 'archived' : sectionId ? 'section' : 'workspace',
        sections: currentWorkspace?.sections || [],
      };
    }, [isArchivePage, sectionId, currentWorkspace]);

  const filterNotebooks = useMemo(() => {
    return filterPads({ page: pageInfo.type });
  }, [pageInfo]);

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

  const showNotebooks = useMemo(
    () =>
      sectionId
        ? allSectionNotebooks && allSectionNotebooks.length > 0
          ? allSectionNotebooks
          : []
        : allNotebooks,
    [allNotebooks, allSectionNotebooks, sectionId]
  );

  if (!currentWorkspace || !session) {
    return <ErrorPage Heading="h1" wellKnown="404" />;
  }

  const handleCreateNotebook = async () => {
    try {
      const args = {
        workspaceId,
        sectionId,
        name: 'My notebook title',
      };

      const { data: createdNotebookData, error } = await createNotebook(args);
      if (error) {
        console.error('Failed to create notebook. Error:', error);
        toast('Failed to create notebook.', 'error');
      } else if (!createdNotebookData) {
        console.error('Failed to create notebook. Received empty response.');
        toast('Failed to create notebook.', 'error');
      } else {
        navigate(
          notebooks({}).notebook({
            notebook: createdNotebookData.createPad,
          }).$
        );
      }
    } catch (err) {
      console.error('Failed to create notebook. Error:', err);
      toast('Failed to create notebook.', 'error');
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
        Heading="h1"
        name={session.user.name || 'Me'}
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
              if (res.data) {
                if (res.data.removeSectionFromWorkspace) {
                  toast('Section removed', 'success');
                }
              } else {
                console.error('Failed to remove section.', res);
                toast('Failed to remove section.', 'error');
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
        onMoveToWorkspace={(id, targetWorkspaceId) => {
          duplicateNotebook({
            id,
            targetWorkspace: targetWorkspaceId,
          })
            .catch((err) => {
              console.error('Failed to duplicate notebook. Error:', err);
              toast('Failed to move notebook to workspace.', 'error');
            })
            .then(() => {
              finalDeleteNotebook({ id }).catch((err) => {
                console.error('Failed to delete notebook. Error:', err);
                toast('Failed to move notebook to workspace.', 'error');
              });
            });
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
          <Route
            path={currentWorkspaceRoute.createNew.template}
            element={
              <CreateWorkspaceModal
                Heading="h2"
                closeHref={currentWorkspaceRoute.$}
                onCreate={(workspaceName) => {
                  createWorkspace({ name: workspaceName })
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
      <div style={{ display: userSettings ? 'block' : 'none' }}>
        <EditUserModal
          name={name !== session.user.email ? name : ''}
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
          onChangeUsername={(newUsername) => {
            setUsernameMutation({
              props: {
                username: newUsername,
              },
            })
              .then((res) => {
                const dta = res.data;
                const err = res.error;

                if (dta) {
                  const { setUsername: usenameChangeSuccessful } = dta;
                  if (usenameChangeSuccessful) {
                    toast(`You are now ${newUsername}`, 'success');
                    setUsername(newUsername);
                  } else {
                    toast(`Username ${newUsername} is already taken`, 'error');
                  }
                } else if (err) {
                  console.error('Failed change username. Error:', err);
                  // this are created by us, not generic error messages.
                  toast(err.graphQLErrors.toString(), 'error');
                }
              })
              .catch((err) => {
                console.error('Failed change username. Error:', err);
                toast('Could not change your username', 'error');
              });
          }}
          onChangeDescription={(newDescription) => {
            updateUser({
              props: {
                description: newDescription,
              },
            })
              .then((r) => {
                if (r.error) {
                  console.error(
                    'Failed to update user description. Error:',
                    r.error
                  );
                  toast('Could not change your description', 'error');
                } else {
                  setDescription(newDescription);
                }
              })
              .catch((err) => {
                console.error('Failed to update user description. Error:', err);
                toast('Could not change your description', 'error');
              });
          }}
        />
      </div>
    </>
  );
};
export default Workspace;

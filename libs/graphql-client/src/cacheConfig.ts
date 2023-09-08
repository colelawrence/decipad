/* eslint-disable no-labels */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { Cache } from '@urql/exchange-graphcache';
import {
  DashboardWorkspaceFragment,
  GetNotebookByIdDocument,
  GetNotebookByIdQuery,
  GetNotebookMetaDocument,
  GetNotebookMetaQuery,
  GetWorkspacesDocument,
  GetWorkspacesQuery,
  GraphCacheConfig,
  Pad,
  Section,
  UserDocument,
  UserQuery,
  Workspace,
  WorkspaceNotebookFragment,
} from './generated';
import * as schema from './schema.generated.json';

const addNotebookToItsWorkspace = (cache: Cache, notebook: Pad) => {
  cache.updateQuery<GetWorkspacesQuery>(
    { query: GetWorkspacesDocument },
    (data) => {
      data?.workspaces
        .find(({ id }) => notebook.workspace?.id === id)
        ?.pads.items.unshift(notebook as Pad);
      return data;
    }
  );
};

const addSectionToItsWorkspace = (
  cache: Cache,
  section: Section,
  workspaceId: string
) => {
  cache.updateQuery<GetWorkspacesQuery>(
    { query: GetWorkspacesDocument },
    (data) => {
      data?.workspaces
        .find(({ id }) => workspaceId === id)
        ?.sections.push(section as Section);
      return data;
    }
  );
};

export const graphCacheConfig: GraphCacheConfig = {
  schema: schema as GraphCacheConfig['schema'],
  keys: {
    UserAccess(data) {
      return data.user?.id ?? null;
    },
    PadConnectionParams(data) {
      return data.url ?? null;
    },
    RoleAccess(data) {
      return data.role?.id ?? null;
    },
    PadSnapshot(data) {
      return data.snapshotName ?? null;
    },
    PagedResult(data) {
      return data.count?.toString() ?? null;
    },
    PagedPadResult(data) {
      return data.count?.toString() ?? null;
    },
  },
  resolvers: {
    PadSnapshot: {
      createdAt: (parent) => {
        // Correct server timestamps
        return new Date(
          new Date(parent.createdAt).getTime() * 1000
        ).toISOString();
      },
    },
  },
  updates: {
    Mutation: {
      createWorkspace: (result, _args, cache) => {
        cache.updateQuery<GetWorkspacesQuery>(
          { query: GetWorkspacesDocument },
          (data) => {
            data?.workspaces.push(result.createWorkspace as Workspace);
            return data;
          }
        );
      },
      removeWorkspace: (_result, args, cache) => {
        cache.invalidate({
          __typename: 'Workspace',
          id: args.id,
        });
      },
      createPad: (result, _args, cache) => {
        addNotebookToItsWorkspace(cache, result.createPad as Pad);
      },
      duplicatePad: (result, _args, cache) => {
        addNotebookToItsWorkspace(cache, result.duplicatePad as Pad);
      },
      importPad: (result, _args, cache) => {
        addNotebookToItsWorkspace(cache, result.importPad as Pad);
      },
      updatePad: (_result, args, cache) => {
        if (args.pad.icon) {
          cache.updateQuery<GetNotebookByIdQuery>(
            {
              query: GetNotebookByIdDocument,
              variables: {
                id: args.id,
              },
            },
            (data) => {
              if (!data?.getPadById) return data;

              data.getPadById.icon = args.pad.icon;
              return data;
            }
          );
          return;
        }

        if (args.pad.status) {
          cache.updateQuery<GetNotebookByIdQuery>(
            {
              query: GetNotebookByIdDocument,
              variables: {
                id: args.id,
              },
            },
            (data) => {
              if (!data?.getPadById) return data;

              data.getPadById.status = args.pad.status;
              return data;
            }
          );
          return;
        }

        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      setPadPublic: (_result, args, cache) => {
        cache.updateQuery<GetNotebookMetaQuery>(
          {
            query: GetNotebookMetaDocument,
            variables: {
              id: args.id,
            },
          },
          (data) => {
            if (!data?.getPadById) {
              throw new Error('QUERY NOT FOUND, there is a bug somewhere...');
            }

            data.getPadById.isPublic = args.isPublic;
            return data;
          }
        );
      },
      createOrUpdateSnapshot() {
        // cache.invalidate({ __typename: 'Pad', id: args.notebookId });
      },
      removePad: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      movePad: (_result, args, cache) => {
        cache.updateQuery<GetWorkspacesQuery>(
          {
            query: GetWorkspacesDocument,
            variables: {
              id: args.id,
            },
          },
          (data) => {
            if (!data?.workspaces) {
              throw new Error('QUERY NOT FOUND, there is a bug somewhere...');
            }

            // O(n^2) to find the workspace of the notebook.
            // Most people have 1 workspace so O(n).
            // But could become performance problem.
            let currentNotebook: WorkspaceNotebookFragment | undefined;
            let currentWorkspace: DashboardWorkspaceFragment | undefined;

            topLoop: for (const workspace of data.workspaces) {
              for (const n of workspace.pads.items) {
                if (n.id === args.id) {
                  currentNotebook = n;
                  currentWorkspace = workspace;
                  break topLoop;
                }
              }
            }

            if (!currentNotebook) {
              throw new Error('Could not find the notebook');
            }

            if (!currentWorkspace) {
              throw new Error('Could not find notebooks workspace');
            }

            // Remove notebook from current workspace
            currentWorkspace.pads.items = currentWorkspace.pads.items.filter(
              (n) => n.id !== args.id
            );

            const targetWorkspace = data.workspaces.find(
              (w) => w.id === args.workspaceId
            );

            // Add notebook to new workspace.
            targetWorkspace?.pads.items.push(currentNotebook);
            return data;
          }
        );
      },
      addSectionToWorkspace: (result, args, cache) => {
        addSectionToItsWorkspace(
          cache,
          result.addSectionToWorkspace as Section,
          args.workspaceId as string
        );
      },
      updateSectionInWorkspace: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Section', id: args.sectionId });
      },
      addNotebookToSection: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Section', id: args.sectionId });
      },
      removeSectionFromWorkspace: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Section', id: args.sectionId });
      },
      sharePadWithSecret: () => {
        // No need to update secret access since we're currently not fetching secret access
        // cache.updateQuery<GetNotebookTopbarQuery>(
        //   { query: GetNotebookTopbarDocument },
        //   (data) => {
        //     const access = data?.getPadById?.access;
        //     if (access && access.secrets) {
        //       access.secrets = [
        //         ...access.secrets,
        //         {
        //           __typename: 'SecretAccess',
        //           secret: result.sharePadWithSecret,
        //           permission: args.permissionType,
        //         },
        //       ];
        //     }
        //     return data;
        //   }
        // );
      },
      unshareNotebookWithSecret: () => {
        // No need to update secret access since we're currently not fetching secret access
        // cache.updateQuery<GetNotebookTopbarQuery>(
        //   { query: GetNotebookTopbarDocument },
        //   (data) => {
        //     const access = data?.getPadById?.access;
        //     if (access && access.secrets) {
        //       access.secrets = access.secrets.filter(
        //         ({ secret }) => secret !== args.secret
        //       );
        //     }
        //     return data;
        //   }
        // );
      },
      fulfilGoal: (_result, args, cache) => {
        cache.updateQuery<UserQuery>({ query: UserDocument }, (data) => {
          data?.selfFulfilledGoals.push(args.props.goalName);
          return data;
        });
      },
      setUsername: (_result, args, cache) => {
        cache.updateQuery<UserQuery>({ query: UserDocument }, (data) => {
          if (args.props.username && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.username = args.props.username;
          }
          return data;
        });
      },
      updateSelf: (_result, args, cache) => {
        cache.updateQuery<UserQuery>({ query: UserDocument }, (data) => {
          if (args.props.hideChecklist && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.hideChecklist = true;
          }
          if (args.props.onboarded && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.onboarded = args.props.onboarded;
          }
          if (args.props.name && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.name = args.props.name;
          }
          if (args.props.description && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.description = args.props.description;
          }
          return data;
        });
      },
    },
  },
};

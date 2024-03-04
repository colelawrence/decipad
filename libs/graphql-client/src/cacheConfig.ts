/* eslint-disable no-labels */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { Cache } from '@urql/exchange-graphcache';
import {
  DashboardWorkspaceFragment,
  ExternalDataSource,
  GetExternalDataSourcesWorkspaceDocument,
  GetExternalDataSourcesWorkspaceQuery,
  GetNotebookByIdDocument,
  GetNotebookByIdQuery,
  GetNotebookMetaDocument,
  GetNotebookMetaQuery,
  GetWorkspacesWithNotebooksDocument,
  GetWorkspacesWithNotebooksQuery,
  GraphCacheConfig,
  Pad,
  Section,
  UserDocument,
  UserQuery,
  Workspace,
  WorkspaceNotebookFragment,
} from './generated';
import * as schema from './schema.generated.json';
import { PublishedVersionName } from './PublishedStates';

const PUBLISHED_SNAPSHOT = PublishedVersionName.Published;

const addNotebookToItsWorkspace = (cache: Cache, notebook: Pad) => {
  cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
    { query: GetWorkspacesWithNotebooksDocument },
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
  cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
    { query: GetWorkspacesWithNotebooksDocument },
    (data) => {
      data?.workspaces
        .find(({ id }) => workspaceId === id)
        ?.sections.push(section as Section);
      return data;
    }
  );
};

/**
 * Returns workspace index and pad index as a tuple type.
 * or undefined if any aren't found.
 *
 * Useful when you want to get a workspace based on a padId.
 */
const getWorkspaceIndexAndPadIndex = (
  workspaces: Array<Workspace>,
  padId: string
): [number, number] | undefined => {
  // The updatePad doesnt know about the workspace of the pad.
  // So we must search workspaces until we find the pad we want.
  // O(n^2) but most users only have 1 workspace, and either way
  // number of workspaces is usually small.

  let workspaceIndex: number | undefined;
  let padIndex: number | undefined;

  outerLoop: for (let i = 0; i < workspaces.length; i += 1) {
    const workspace = workspaces[i];
    for (let j = 0; j < workspace.pads.items.length; j += 1) {
      const pad = workspace.pads.items[j];
      if (pad.id === padId) {
        workspaceIndex = i;
        padIndex = j;
        break outerLoop;
      }
    }
  }

  if (workspaceIndex == null) return undefined;
  if (padIndex == null) return undefined;

  return [workspaceIndex, padIndex];
};

//
// Important that we include section ID as a composite key,
// otherwise we will not regiser that notebooks are part of sections.
//
// This is likely a misunderstaing of Urql cache on my part, but
// until I figure it out we need to have this as a key.
//
function getPadId(pad: Pad) {
  if (pad.sectionId == null) {
    return pad.id;
  }

  return `${pad.id}-section-${pad.sectionId}`;
}

export const graphCacheConfig: GraphCacheConfig = {
  schema: schema as GraphCacheConfig['schema'],
  keys: {
    Pad(data) {
      return getPadId(data as Pad);
    },
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
  optimistic: {
    setPadPublic() {
      return {
        input: true,
        output: true,
      };
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
        cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
          { query: GetWorkspacesWithNotebooksDocument },
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
      createOrUpdateSnapshot(_result, { params: args }, cache) {
        if (typeof args.remoteState !== 'string') return;

        cache.updateQuery<GetNotebookMetaQuery>(
          {
            query: GetNotebookMetaDocument,
            variables: {
              id: args.notebookId,
            },
          },
          (data) => {
            if (!data?.getPadById) return data;

            const publishedSnapshot = data.getPadById.snapshots.find(
              (s) => s.snapshotName === PUBLISHED_SNAPSHOT
            );

            //
            // Update the published snapshot to reflect the latest state.
            // Useful for telling the user if they have unpublished changes.
            //
            if (!publishedSnapshot) {
              data.getPadById.snapshots.push({
                __typename: 'PadSnapshot',
                snapshotName: PUBLISHED_SNAPSHOT,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
                version: args.remoteVersion,
              });
            } else {
              publishedSnapshot.updatedAt = new Date().getTime();
              publishedSnapshot.version = args.remoteVersion;
            }

            return data;
          }
        );
      },
      createExternalDataSource: (_result, args, cache) => {
        if (typeof args.dataSource.workspace_id !== 'string') return;
        cache.updateQuery<GetExternalDataSourcesWorkspaceQuery>(
          {
            query: GetExternalDataSourcesWorkspaceDocument,
            variables: {
              workspaceId: args.dataSource.workspace_id,
            },
          },
          (data) => {
            if (!data?.getExternalDataSourcesWorkspace) return data;

            data.getExternalDataSourcesWorkspace.items.push(
              args.dataSource as ExternalDataSource
            );

            return data;
          }
        );
      },
      updatePad: (_result, args, cache) => {
        //
        // Updating Pad!
        // - The workspace is aware of pads by `GetWorkspaces` query.
        // - Therefore, we need to update both the notebook query and this workspace query.
        //

        cache.updateQuery<GetNotebookByIdQuery>(
          {
            query: GetNotebookByIdDocument,
            variables: {
              id: args.id,
            },
          },
          (data) => {
            if (!data?.getPadById) return data;

            for (const [k, v] of Object.entries(args.pad)) {
              if (v != null) {
                data.getPadById[k as keyof typeof data.getPadById] = v;
              }
            }
            return data;
          }
        );

        cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
          {
            query: GetWorkspacesWithNotebooksDocument,
          },
          (data) => {
            if (!data) return data;

            const indexes = getWorkspaceIndexAndPadIndex(
              data.workspaces as Array<Workspace>,
              args.id.toString()
            );

            if (!indexes) return data;
            const [workspaceIndex, padIndex] = indexes;

            for (const [k, v] of Object.entries(args.pad)) {
              if (v != null) {
                data.workspaces[workspaceIndex].pads.items[padIndex][
                  k as keyof typeof data.workspaces[number]['pads']['items'][number]
                ] = v;
              }
            }

            return data;
          }
        );
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

            if (args.publishState === 'PUBLICLY_HIGHLIGHTED') {
              data.getPadById.isPublic = true;
              data.getPadById.userAllowsPublicHighlighting = true;
              return data;
            }

            if (args.publishState === 'PUBLIC') {
              data.getPadById.isPublic = true;
              data.getPadById.userAllowsPublicHighlighting = false;
              return data;
            }

            if (args.publishState === 'PRIVATE') {
              data.getPadById.isPublic = false;
              data.getPadById.userAllowsPublicHighlighting = false;

              const snapshots = data.getPadById.snapshots.map((s) => ({
                ...s,
                snapshotName: PublishedVersionName.Unpublished,
              }));
              data.getPadById.snapshots = snapshots;

              return data;
            }

            throw new Error('Should never reach this');
          }
        );
      },
      removePad: (_result, args, cache) => {
        cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
          {
            query: GetWorkspacesWithNotebooksDocument,
          },
          (data) => {
            if (!data) return data;

            const indexes = getWorkspaceIndexAndPadIndex(
              data.workspaces as Array<Workspace>,
              args.id.toString()
            );

            if (!indexes) return data;
            const [workspaceIndex, padIndex] = indexes;

            data.workspaces[workspaceIndex].pads.items.splice(padIndex, 1);

            return data;
          }
        );
      },
      movePad: (_result, args, cache) => {
        cache.updateQuery<GetWorkspacesWithNotebooksQuery>(
          {
            query: GetWorkspacesWithNotebooksDocument,
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
      shareWorkspaceWithEmail(_result, args, cache) {
        cache.invalidate({ __typename: 'Workspace', id: args.id });
      },
      unshareWorkspaceWithUser(_result, args, cache) {
        cache.invalidate({ __typename: 'Workspace', id: args.id });
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
          if (args.props.onboarded && data?.self) {
            data.self.onboarded = args.props.onboarded;
          }
          if (args.props.name && data?.self) {
            data.self.name = args.props.name;
          }
          if (args.props.description && data?.self) {
            data.self.description = args.props.description;
          }
          return data;
        });
      },
    },
  },
};

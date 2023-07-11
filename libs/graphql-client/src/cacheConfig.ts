import { Cache } from '@urql/exchange-graphcache';
import {
  GetWorkspacesDocument,
  GetWorkspacesQuery,
  GraphCacheConfig,
  Pad,
  Section,
  UserDocument,
  UserQuery,
  Workspace,
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
    PagedPadResult() {
      return null;
    },
    PadAccess() {
      return null;
    },
    UserAccess() {
      return null;
    },
    WorkspaceAccess() {
      return null;
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
        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      setPadPublic: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      removePad: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      movePad: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.id });
      },
      addSectionToWorkspace: (result, args, cache) => {
        addSectionToItsWorkspace(
          cache,
          result.addSectionToWorkspace as Section,
          args.workspaceId as string
        );
      },
      createOrUpdateSnapshot: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.notebookId });
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

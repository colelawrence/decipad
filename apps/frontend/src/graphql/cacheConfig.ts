import { Cache } from '@urql/exchange-graphcache';
import {
  GetWorkspacesDocument,
  GetWorkspacesQuery,
  GraphCacheConfig,
  Pad,
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
        ?.pads.items.push(notebook as Pad);
      return data;
    }
  );
};

export const graphCacheConfig: GraphCacheConfig = {
  schema: schema as any,
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
  },
  resolvers: {
    PadSnapshot: {
      createdAt: (parent) => {
        // Correct server timestamps
        return new Date(new Date(parent.createdAt).getTime() * 1000);
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
      removePad: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Pad', id: args.id });
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
      updateSelf: (_result, args, cache) => {
        cache.updateQuery<UserQuery>({ query: UserDocument }, (data) => {
          if (args.props.hideChecklist && data?.self) {
            /* eslint-disable no-param-reassign */
            data.self.hideChecklist = true;
          }
          return data;
        });
      },
    },
  },
};

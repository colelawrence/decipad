/* eslint-disable no-labels */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import type { Cache } from '@urql/exchange-graphcache';
import type {
  ExternalDataSource,
  GetExternalDataSourcesWorkspaceQuery,
  GetExternalDataSourcesWorkspaceQueryVariables,
  GetNotebookAnnotationsQuery,
  GetNotebookAnnotationsQueryVariables,
  GetNotebookMetaQuery,
  GetWorkspacesWithSharedNotebooksQuery,
  GraphCacheConfig,
  Pad,
  Section,
  UserQuery,
  Workspace,
  GetWorkspaceNotebooksQuery,
  GetWorkspaceNotebooksQueryVariables,
  WorkspaceNotebookFragment,
  GetNotebookByIdQuery,
  GetNotebookByIdQueryVariables,
} from './generated';
import {
  GetExternalDataSourcesWorkspaceDocument,
  GetNotebookAnnotationsDocument,
  GetNotebookMetaDocument,
  GetWorkspacesWithSharedNotebooksDocument,
  UserDocument,
  GetWorkspaceNotebooksDocument,
  GetNotebookByIdDocument,
} from './generated';
import * as schema from './schema.generated.json';
import { nanoid } from 'nanoid';
import { PublishedVersionName } from './PublishedStates';
import { gql } from 'urql';
import type { Session } from 'next-auth';

const PUBLISHED_SNAPSHOT = PublishedVersionName.Published;

const addNotebookToItsWorkspace = (
  cache: Cache,
  { notebook, workspaceId }: { notebook: Pad; workspaceId: string | number }
) => {
  cache.updateQuery<GetWorkspaceNotebooksQuery>(
    { query: GetWorkspaceNotebooksDocument, variables: { workspaceId } },
    (data) => {
      data?.pads.items.unshift(notebook as Pad);
      return data;
    }
  );
};

const addSectionToItsWorkspace = (
  cache: Cache,
  section: Section,
  workspaceId: string
) => {
  cache.updateQuery<GetWorkspacesWithSharedNotebooksQuery>(
    { query: GetWorkspacesWithSharedNotebooksDocument },
    (data) => {
      data?.workspaces
        .find(({ id }) => workspaceId === id)
        ?.sections.push(section as Section);
      return data;
    }
  );
};

export const graphCacheConfig = (session?: Session): GraphCacheConfig => ({
  schema: schema as GraphCacheConfig['schema'],
  keys: {
    UserAccess(data) {
      // Needs to be composite of userId + padId
      //
      // Because UserAccess needs to be uniquely identified,
      // And userId is not enough, because the same user
      // can be on multiple notebooks (think shared notebooks).
      //
      // So we must include both userId and the parent resourceId.
      if (data.userId == null || data.resourceId == null) {
        return null;
      }

      return `${data.userId}-${data.resourceId}`;
    },
    RoleAccess(data) {
      // Same comment as the UserAccess
      if (data.roleId == null || data.resourceId == null) {
        return null;
      }

      return `${data.roleId}-${data.resourceId}`;
    },
    PadConnectionParams(data) {
      return data.url ?? null;
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
    createAnnotation(args) {
      const value: ReturnType<
        NonNullable<
          NonNullable<GraphCacheConfig['optimistic']>['createAnnotation']
        >
      > = {
        __typename: 'Annotation',
        id: nanoid(),
        dateCreated: new Date().getTime(),
        dateUpdated: new Date().getTime(),
        content: args.content,
        pad_id: args.padId,
        scenario_id: null,
        ...(session?.user
          ? {
              user: {
                __typename: 'AnnotationUser',
                id: session.user.email ?? '',
                username: session.user.name ?? '',
                avatar: session.user.image ?? '',
              },
            }
          : {}),
      };
      return value;
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
        cache.updateQuery<GetWorkspacesWithSharedNotebooksQuery>(
          { query: GetWorkspacesWithSharedNotebooksDocument },
          (data) => {
            data?.workspaces.push(result.createWorkspace as Workspace);
            return data;
          }
        );
      },
      createAnnotation: (result, args, cache) => {
        // result.createAnnotation?.user is never defined, so we're stealing the user from the session

        const user = session?.user;
        if (!result.createAnnotation || !user) {
          return;
        }

        cache.updateQuery<
          GetNotebookAnnotationsQuery,
          GetNotebookAnnotationsQueryVariables
        >(
          {
            query: GetNotebookAnnotationsDocument,
            variables: { notebookId: args.padId },
          },
          (data) => {
            if (!data || !data.getAnnotationsByPadId) {
              return data;
            }

            data.getAnnotationsByPadId.push({
              dateCreated: new Date().getTime(),
              content: args.content,
              pad_id: args.padId,
              block_id: args.blockId,
              id: nanoid(),
              user: user.name
                ? {
                    __typename: 'AnnotationUser',
                    id: '',
                    username: user.name,
                    avatar: user.image,
                  }
                : undefined,
              ...result.createAnnotation,
            });
            return data;
          }
        );
      },
      deleteAnnotation: (_result, args, cache) => {
        cache.invalidate({
          __typename: 'Annotation',
          id: args.id,
        });
      },
      removeWorkspace: (_result, args, cache) => {
        cache.invalidate({
          __typename: 'Workspace',
          id: args.id,
        });
      },
      createPad: (result, args, cache) => {
        addNotebookToItsWorkspace(cache, {
          notebook: result.createPad as Pad,
          workspaceId: args.workspaceId,
        });
      },
      duplicatePad: (result, args, cache) => {
        addNotebookToItsWorkspace(cache, {
          notebook: result.duplicatePad as Pad,
          workspaceId: args.targetWorkspace,
        });
      },
      importPad: (result, args, cache) => {
        addNotebookToItsWorkspace(cache, {
          notebook: result.importPad as Pad,
          workspaceId: args.workspaceId,
        });
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
        if (typeof args.dataSource.workspaceId !== 'string') return;
        cache.updateQuery<GetExternalDataSourcesWorkspaceQuery>(
          {
            query: GetExternalDataSourcesWorkspaceDocument,
            variables: {
              workspaceId: args.dataSource.workspaceId,
            },
          },
          (data) => {
            if (!data?.getExternalDataSourcesWorkspace) return data;

            data.getExternalDataSourcesWorkspace.push(
              args.dataSource as ExternalDataSource
            );

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
        cache.invalidate({
          __typename: 'Pad',
          id: args.id,
        });
      },
      movePad: (_result, args, cache) => {
        let pad: WorkspaceNotebookFragment | undefined;
        cache.updateQuery<
          GetWorkspaceNotebooksQuery,
          GetWorkspaceNotebooksQueryVariables
        >(
          {
            query: GetWorkspaceNotebooksDocument,
            variables: {
              workspaceId: args.fromWorkspaceId!,
            },
          },
          (data) => {
            const workspacePads = data?.pads;

            if (!workspacePads) {
              throw new Error('Something went wrong');
            }

            const padIndex = workspacePads.items.findIndex(
              (p) => p.id === args.id
            );

            if (padIndex === -1) {
              throw new Error('Could not find the notebook');
            }

            pad = workspacePads.items[padIndex];

            workspacePads.items.splice(padIndex, 1);

            workspacePads.count--;

            return data;
          }
        );
        cache.updateQuery<
          GetWorkspaceNotebooksQuery,
          GetWorkspaceNotebooksQueryVariables
        >(
          {
            query: GetWorkspaceNotebooksDocument,
            variables: {
              workspaceId: args.workspaceId,
            },
          },
          (data) => {
            const workspacePads = data?.pads;

            if (!workspacePads) {
              return data;
            }

            if (pad == null) {
              throw new Error('Could not find the notebook');
            }

            workspacePads.items.push(pad);

            workspacePads.count++;

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
      removeExternalDataSource(_result, args, cache) {
        if (args.workspaceId == null) {
          return;
        }

        cache.updateQuery<
          GetExternalDataSourcesWorkspaceQuery,
          GetExternalDataSourcesWorkspaceQueryVariables
        >(
          {
            query: GetExternalDataSourcesWorkspaceDocument,
            variables: { workspaceId: args.workspaceId },
          },
          (data) => {
            if (data == null) {
              return data;
            }

            const externalDataId =
              data.getExternalDataSourcesWorkspace.findIndex(
                (d) => d.id === args.id
              );
            if (externalDataId === -1) {
              throw new Error('Could not find external data to delete');
            }

            data.getExternalDataSourcesWorkspace.splice(externalDataId, 1);

            return data;
          }
        );
      },
      updateSectionInWorkspace: (_result, args, cache) => {
        cache.invalidate({ __typename: 'Section', id: args.sectionId });
      },
      addNotebookToSection: (_result, args, cache) => {
        cache.writeFragment(
          gql`
            fragment _ on Pad {
              id
              sectionId
            }
          `,
          { id: args.notebookId, sectionId: args.sectionId }
        );
      },
      attachFileToPad(result, _args, cache) {
        const attachment = result.attachFileToPad!;
        if (attachment == null || attachment.padId == null) {
          return;
        }

        cache.updateQuery<GetNotebookByIdQuery, GetNotebookByIdQueryVariables>(
          {
            query: GetNotebookByIdDocument,
            variables: { id: attachment.padId },
          },
          (data) => {
            if (data?.getPadById == null) {
              throw new Error('GetPadById query is missing');
            }

            data.getPadById.attachments.push({
              id: attachment.id!,
              fileName: attachment.fileName!,
              fileType: attachment.fileType!,
              fileSize: attachment.fileSize!,
              url: attachment.url!,
            });

            return data;
          }
        );
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
});

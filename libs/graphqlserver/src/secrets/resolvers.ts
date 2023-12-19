import { GraphqlContext, SecretRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { resource } from '@decipad/backend-resources';
import { UserInputError } from 'apollo-server-lambda';
import { Resolvers } from '@decipad/graphqlserver-types';

const workspaces = resource('workspace');

const getWorkspaceSecrets = async (
  workspaceId: string,
  context: GraphqlContext
): Promise<SecretRecord[]> => {
  await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const data = await tables();
  return (
    await data.secrets.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items;
};

const resolvers: Resolvers = {
  Query: {
    async getWorkspaceSecrets(_, { workspaceId }, context) {
      return getWorkspaceSecrets(workspaceId, context);
    },
  },

  Mutation: {
    async createSecret(_, { workspaceId, secret }, context) {
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: workspaceId,
        minimumPermissionType: 'ADMIN',
      });
      const name = secret.name.trim();
      if (!name) {
        throw new UserInputError('secret name needs to be filled');
      }

      if (name.replaceAll(' ', '') !== name) {
        throw new UserInputError('secret name cannot have spaces');
      }

      const newSecret: SecretRecord = {
        id: `/workspaces/${workspaceId}/secrets/${name}`,
        workspace_id: workspaceId,
        name,
        secret: secret.secret,
      };
      const data = await tables();
      await data.secrets.create(newSecret);
      return newSecret;
    },

    async updateSecret(_, { secretId, secret: newSecret }, context) {
      const data = await tables();
      const secret = await data.secrets.get({ id: secretId });
      if (!secret) {
        throw new UserInputError('Not found');
      }
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: secret.workspace_id,
        minimumPermissionType: 'ADMIN',
      });
      const name = secret.name.trim();
      if (!name) {
        throw new UserInputError('secret name needs to be filled');
      }
      secret.secret = newSecret;

      await data.secrets.put(secret);
      return secret;
    },

    async removeSecret(_, { secretId }, context) {
      const data = await tables();
      const secret = await data.secrets.get({ id: secretId });
      if (!secret) {
        throw new UserInputError('Not found');
      }
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: secret.workspace_id,
        minimumPermissionType: 'ADMIN',
      });

      await data.secrets.delete({ id: secretId });
      return true;
    },
  },

  Workspace: {
    async secrets(workspace, _, context) {
      return getWorkspaceSecrets(workspace.id, context);
    },
  },
};

export default resolvers;

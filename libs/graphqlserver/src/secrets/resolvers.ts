import {
  GraphqlContext,
  ID,
  SecretInput,
  SecretRecord,
  Workspace,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { resource } from '@decipad/backend-resources';
import { UserInputError } from 'apollo-server-lambda';

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

export default {
  Query: {
    async getWorkspaceSecrets(
      _: unknown,
      { workspaceId }: { workspaceId: ID },
      context: GraphqlContext
    ): Promise<SecretRecord[]> {
      return getWorkspaceSecrets(workspaceId, context);
    },
  },

  Mutation: {
    async createSecret(
      _: unknown,
      { workspaceId, secret }: { workspaceId: string; secret: SecretInput },
      context: GraphqlContext
    ): Promise<SecretRecord> {
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: workspaceId,
        minimumPermissionType: 'ADMIN',
      });
      const name = secret.name.trim();
      if (!name) {
        throw new UserInputError('secret name needs to be filled');
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

    async updateSecret(
      _: unknown,
      { secretId, secret: newSecret }: { secretId: string; secret: string },
      context: GraphqlContext
    ): Promise<SecretRecord> {
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

    async removeSecret(
      _: unknown,
      { secretId }: { secretId: string },
      context: GraphqlContext
    ): Promise<boolean> {
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
    async secrets(workspace: Workspace, _: unknown, context: GraphqlContext) {
      return getWorkspaceSecrets(workspace.id, context);
    },
  },
};

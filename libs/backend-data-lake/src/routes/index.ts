import { badRequest, notFound, unauthorized } from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import type { PermissionType, User } from '@decipad/backendtypes';
import { parseBody } from '@decipad/backend-utils';
import type { Route } from '../utils/router';
import { createDataLake } from '../services/createDataLake';
import { getDataLake } from '../services/getDataLake';
import { datalake } from '@decipad/backend-config';
import { processSuccessfulSyncNotification } from '../services/processSuccessfulSyncNotification';
import { createConnection } from '../services/createConnection';
import { getSource } from '../types';
import { getConnectionConfig } from '../utils/getConnectionConfig';
import { checkConnection } from '../services/checkConnection';
import { processCustomSyncNotification } from '../services/processCustomSyncNotification';
import { queryWorkspace } from '../services/queryWorkspace';
import tables from '@decipad/tables';
import { getWorkspaceSchema } from '../services/getWorkspaceSchema';

const workspaces = resource('workspace');

const protectWorkspace = async (
  user: User | undefined,
  workspaceId: unknown,
  minimumPermissionType: PermissionType = 'READ'
): Promise<string> => {
  if (!user) {
    throw unauthorized('Unauthorized');
  }
  if (typeof workspaceId !== 'string') {
    throw badRequest('Invalid workspaceId');
  }
  await workspaces.expectAuthorized({
    recordId: workspaceId,
    minimumPermissionType,
    user,
  });

  return workspaceId;
};

const protectNotebook = async (
  user: User | undefined,
  notebookId: unknown,
  minimumPermissionType: PermissionType = 'READ'
): Promise<[notebookId: string, workspaceId: string]> => {
  if (!user) {
    throw unauthorized('Unauthorized');
  }
  if (typeof notebookId !== 'string') {
    throw badRequest('Invalid notebookId');
  }
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound('Notebook not found');
  }
  const workspaceId = notebook.workspace_id;
  if (!workspaceId) {
    throw badRequest('Notebook has no workspace');
  }
  await protectWorkspace(user, workspaceId, minimumPermissionType);
  return [notebookId, workspaceId];
};

export const routes = (): Route[] => [
  {
    method: 'GET',
    path: '/api/datalakes/:workspaceId',
    handler: async (_, user, params) => {
      const { workspaceId } = params;
      if (typeof workspaceId !== 'string') {
        throw badRequest('Invalid workspaceId');
      }
      await protectWorkspace(user, workspaceId);

      const dataLake = await getDataLake(workspaceId);
      if (!dataLake) {
        throw notFound('Data lake not found');
      }
      if (dataLake.state === 'pending') {
        throw notFound('Data lake not ready');
      }
      return dataLake;
    },
  },
  {
    method: 'POST',
    path: '/api/datalakes/create',
    handler: async (req, user) => {
      // // creates a data lake
      const { workspaceId: _workspaceId } = await parseBody(req);
      const workspaceId = await protectWorkspace(user, _workspaceId, 'ADMIN');

      await createDataLake({
        workspaceId,
      });

      return { ok: true };
    },
  },
  {
    method: 'POST',
    path: '/api/datalakes/:workspaceId/connections',
    handler: async (req, user, params) => {
      const { workspaceId } = params;
      if (typeof workspaceId !== 'string') {
        throw badRequest('Invalid workspaceId');
      }
      if (typeof workspaceId !== 'string') {
        throw badRequest('Invalid workspaceId');
      }
      await protectWorkspace(user, workspaceId, 'ADMIN');

      const { source, connectionConfig } = await parseBody(req);
      await createConnection(
        workspaceId,
        getSource(source),
        getConnectionConfig(connectionConfig)
      );

      return { ok: true };
    },
  },
  {
    method: 'POST',
    path: '/api/datalakes/query',
    handler: async (req, user) => {
      const requestBody = await parseBody(req);
      const { notebookId } = requestBody;

      const [, workspaceId] = await protectNotebook(user, notebookId, 'READ');
      return queryWorkspace(workspaceId, requestBody);
    },
  },
  {
    method: 'GET',
    path: '/api/datalakes/:workspaceId/connections/:sourceType/health',
    handler: async (_, user, params) => {
      const { workspaceId, sourceType } = params;
      if (typeof workspaceId !== 'string') {
        throw badRequest('Invalid workspaceId');
      }
      if (typeof sourceType !== 'string') {
        throw badRequest('Invalid sourceType');
      }
      await protectWorkspace(user, workspaceId, 'ADMIN');
      await checkConnection(workspaceId, getSource(sourceType));
      return { ok: true };
    },
  },
  {
    method: 'GET',
    path: '/api/datalakes/schema',
    handler: async (req, user) => {
      const { notebookId } = req.queryStringParameters ?? {};
      if (typeof notebookId !== 'string') {
        throw badRequest('Invalid notebookId');
      }
      const [, workspaceId] = await protectNotebook(user, notebookId, 'READ');
      return getWorkspaceSchema(workspaceId);
    },
  },
  {
    method: 'POST',
    path: '/api/datalakes/webhooks/successful-sync',
    handler: async (req) => {
      const { secret } = req.queryStringParameters ?? {};
      if (typeof secret !== 'string') {
        // we throw an internal error so that we get notified, because this would signal a problem with the webhook configuration
        throw badRequest('No secret');
      }

      // validate if the secret is correct
      if (secret !== datalake().webhookSecret) {
        throw badRequest('Invalid secret');
      }

      const body = await parseBody(req);
      // eslint-disable-next-line no-console
      console.log('/api/datalakes/webhooks/successful-sync body', body);
      await processSuccessfulSyncNotification(body);
      return { ok: true };
    },
  },
  {
    method: 'POST',
    path: '/api/datalakes/webhooks/custom-sync',
    handler: async (req) => {
      const { secret } = req.queryStringParameters ?? {};
      if (typeof secret !== 'string') {
        // we throw an internal error so that we get notified, because this would signal a problem with the webhook configuration
        throw badRequest('No secret');
      }

      // validate if the secret is correct
      if (secret !== datalake().webhookSecret) {
        throw badRequest('Invalid secret');
      }

      const body = await parseBody(req);
      await processCustomSyncNotification(body);
      return { ok: true };
    },
  },
];

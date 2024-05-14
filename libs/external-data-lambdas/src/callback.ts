/* eslint-disable prefer-destructuring */
import {
  provider as externalDataProvider,
  saveExternalKey,
} from '@decipad/externaldata';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import type {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2 as HttpResponse,
} from 'aws-lambda';
import { getDefined } from '@decipad/utils';
import { decodeState } from './state';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';
import { app } from '@decipad/backend-config';
import type { ExternalDataSourceRecord } from '@decipad/backendtypes';

const getExistingExternalData = async (
  name: string,
  workspaceId: string
): Promise<ExternalDataSourceRecord | undefined> => {
  const data = await tables();

  const { Items } = await data.externaldatasources.query({
    IndexName: 'byWorkspace',
    KeyConditionExpression: 'workspace_id = :workspace_id',
    ExpressionAttributeValues: {
      ':workspace_id': workspaceId,
    },
  });

  const sameNameResources = Items.filter((i) => i.name === name);

  if (sameNameResources.length > 1) {
    // eslint-disable-next-line no-console
    console.error('DB is in invalid state, we should only have 1 of each');
  }

  if (sameNameResources.length === 0) {
    return undefined;
  }

  return sameNameResources[0];
};

const deleteExternalData = async (externalDataId: string) => {
  const data = await tables();

  return data.externaldatasources.delete({ id: externalDataId });
};

const callbackWithThrows = async (
  event: APIGatewayProxyEvent,
  _externalDataSource: ExternalDataSourceRecord,
  state: ReturnType<typeof decodeState>,
  code: string
): Promise<HttpResponse> => {
  const data = await tables();

  let externalDataSource = _externalDataSource;

  const user = await checkNotebookOrWorkspaceAccess({
    workspaceId: externalDataSource.workspace_id,
    notebookId: externalDataSource.padId,
    event,
    permissionType: 'READ',
  });

  if (!user) {
    await deleteExternalData(externalDataSource.id);
    throw Boom.forbidden();
  }

  const provider = externalDataProvider(externalDataSource.provider);

  if (provider == null) {
    await deleteExternalData(externalDataSource.id);
    throw Boom.badRequest(`no such provider: ${externalDataSource.provider}`);
  }

  const acccessTokenResponse = await provider.getAccessToken(code);

  const existentExternalData = await getExistingExternalData(
    acccessTokenResponse.resourceName,
    externalDataSource.workspace_id!
  );

  if (existentExternalData != null) {
    await data.externaldatasources.delete({ id: externalDataSource.id });
    externalDataSource = existentExternalData;
  } else {
    externalDataSource.name = acccessTokenResponse.resourceName;
    externalDataSource.expires_at = undefined;

    await data.externaldatasources.put(externalDataSource);
  }

  await saveExternalKey({
    externalDataSource,
    userId: user.id,
    tokenType: acccessTokenResponse.tokenType,
    accessToken: acccessTokenResponse.accessToken,
    refreshToken: acccessTokenResponse.refreshToken,
    expiresIn: acccessTokenResponse.expiresIn,
  });

  return {
    statusCode: 302,
    headers: {
      Location: state.completionUrl,
    },
  };
};

const errorReturn = {
  statusCode: 302,
  headers: {
    Location: app().urlBase,
  },
};

export const callback = async (
  event: APIGatewayProxyEvent
): Promise<HttpResponse> => {
  const { code, state: stringState } = getDefined(event.queryStringParameters);

  if (!stringState || !code) {
    return errorReturn;
  }

  const state = decodeState(stringState);

  const data = await tables();
  const externalDataSource = await data.externaldatasources.get({
    id: state.externalDataId,
  });
  if (!externalDataSource) {
    throw Boom.notFound();
  }

  try {
    return await callbackWithThrows(event, externalDataSource, state, code);
  } catch (e) {
    await deleteExternalData(externalDataSource.id);
    return errorReturn;
  }
};

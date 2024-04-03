import { provider as externalDataProvider } from '@decipad/externaldata';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2 as HttpResponse,
} from 'aws-lambda';
import { OAuth2 } from 'oauth';
import { getDefined } from '@decipad/utils';
import { getOAuthResponse } from './promisify-oauth';
import { saveExternalKey } from './save-keys';
import { decodeState } from './state';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';
import { app } from '@decipad/backend-config';

export const callback = async (
  event: APIGatewayProxyEvent
): Promise<HttpResponse> => {
  const { code, state: stringState } = getDefined(event.queryStringParameters);

  const config = app();

  if (!stringState || !code) {
    return {
      statusCode: 302,
      headers: {
        Location: config.urlBase,
      },
    };
  }

  const state = decodeState(stringState);

  const data = await tables();
  const externalDataSource = await data.externaldatasources.get({
    id: state.externalDataId,
  });
  if (!externalDataSource) {
    throw Boom.notFound();
  }

  const user = await checkNotebookOrWorkspaceAccess({
    workspaceId: externalDataSource.workspace_id,
    notebookId: externalDataSource.padId,
    event,
    permissionType: 'READ',
  });

  if (!user) {
    throw Boom.forbidden();
  }

  const provider = getDefined(
    externalDataProvider(externalDataSource.provider),
    `no such provider: ${externalDataSource.provider}`
  );

  //
  // Let's always set `isProcessing` to false here.
  // To `unlock` it to the user
  //
  externalDataSource.isProcessing = false;
  await data.externaldatasources.put(externalDataSource);

  const authorizationUrl = new URL(provider.authorizationUrl);
  const authorizePath = authorizationUrl.pathname;
  const accessTokenPath = new URL(provider.accessTokenUrl).pathname;

  if (provider.type === 'notion') {
    const {
      accessToken,
      resourceName,
      workspaceId: notionWorkspaceId,
    } = await provider.getAccessToken(code);

    const existingExternalData = await data.externaldatasources.query({
      IndexName: 'byExternalId',
      KeyConditionExpression:
        'externalId = :externalId AND workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':externalId': notionWorkspaceId,
        ':workspace_id': externalDataSource.workspace_id!,
      },
    });

    if (existingExternalData.Items.length > 1) {
      throw new Error(
        'Database is in bad state - Multiple external data with same externalId'
      );
    }

    //
    // If true, then external, then we have `updated` connection.
    // Because the notion workspaceId is the same as the existing
    // externalData.externalId
    //
    // A brand new externalDataSource will have externalId as nanoid.
    //
    // So lets:
    // 1) Update the key to the new access token.
    //
    if (existingExternalData.Items.length === 1) {
      const existingData = existingExternalData.Items[0];

      await saveExternalKey({
        externalDataSource: existingData,
        user,
        tokenType: 'Bearer',
        accessToken,
      });

      return {
        statusCode: 302,
        headers: {
          Location: state.completionUrl,
        },
      };
    }

    await saveExternalKey({
      externalDataSource,
      user,
      tokenType: 'Bearer',
      accessToken,
    });

    externalDataSource.name = resourceName;
    externalDataSource.externalId = notionWorkspaceId;
    await data.externaldatasources.put(externalDataSource);

    return {
      statusCode: 302,
      headers: {
        Location: state.completionUrl,
      },
    };
  }

  const oauth2Client = new OAuth2(
    provider.clientId,
    provider.clientSecret,
    authorizationUrl.origin,
    authorizePath,
    accessTokenPath,
    provider.headers ?? {}
  );

  return getOAuthResponse(
    oauth2Client,
    code,
    provider,
    externalDataSource,
    user,
    state
  );
};

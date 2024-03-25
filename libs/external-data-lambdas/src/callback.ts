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

async function saveExternalResourceName(
  externalDataId: string,
  name: string
): Promise<void> {
  const data = await tables();

  const datasource = await data.externaldatasources.get({ id: externalDataId });
  if (datasource == null) {
    throw new Error('External data source could not be found');
  }

  datasource.name = name;

  await data.externaldatasources.put(datasource);
}

export const callback = async (
  event: APIGatewayProxyEvent
): Promise<HttpResponse> => {
  const { code, state: stringState } = getDefined(event.queryStringParameters);

  if (!stringState || !code) {
    return {
      statusCode: 401,
      body: 'missing parameters',
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

  const authorizationUrl = new URL(provider.authorizationUrl);
  const authorizePath = authorizationUrl.pathname;
  const accessTokenPath = new URL(provider.accessTokenUrl).pathname;

  if (provider.getAccessToken != null) {
    const { accessToken, refreshToken, resourceName } =
      await provider.getAccessToken(code);

    if (resourceName != null) {
      await saveExternalResourceName(state.externalDataId, resourceName);
    }

    await saveExternalKey({
      externalDataSource,
      user,
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
    });

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

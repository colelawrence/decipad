import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { OAuth2 } from 'oauth';
import { nanoid } from 'nanoid';
import { stringify as encodeCookie } from 'simple-cookie';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { provider as externalDataProvider } from '@decipad/externaldata';
import { app } from '@decipad/config';
import { getDefined } from '@decipad/utils';
import handle from '../handle';

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const { user } = await authenticate(event);
    if (!user) {
      return {
        statusCode: 401,
        body: 'Needs authentication',
      };
    }

    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 401,
        body: 'missing parameters',
      };
    }
    const resource = `/externaldatasources/${id}`;
    if (!(await isAuthorized(resource, user, 'READ'))) {
      return {
        statusCode: 403,
        body: 'Needs authorization',
      };
    }

    const data = await tables();
    const externalDataSource = await data.externaldatasources.get({ id });
    if (!externalDataSource) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

    const provider = getDefined(
      externalDataProvider(externalDataSource.provider),
      'no such provider'
    );

    const authorizationUrl = new URL(provider.authorizationUrl);
    const getThirdPartyBaseUrlFromHeaders =
      provider.id === 'testdatasource' &&
      event.headers['x-use-third-party-test-server'];
    const basePath = getThirdPartyBaseUrlFromHeaders
      ? getDefined(event.headers['x-use-third-party-test-server'])
      : authorizationUrl.origin;
    const authorizePath = authorizationUrl.pathname;
    const accessTokenPath = new URL(provider.accessTokenUrl).pathname;
    const oauth2Client = new OAuth2(
      provider.clientId,
      provider.clientSecret,
      basePath,
      authorizePath,
      accessTokenPath,
      provider.headers || {}
    );

    const config = app();
    const authorizeUrl = oauth2Client.getAuthorizeUrl({
      ...provider.authorizationParams,
      scope: provider.scope,
      redirect_uri: `${config.urlBase}${config.apiPathBase}/externaldatasources/callback`,
      cacheBuster: nanoid(),
    });

    // set client cookies
    const cookies = [
      encodeCookie({
        name: 'externaldatasourceid',
        value: id,
        httponly: true,
        path: '/',
      }),
    ];
    const { redirect_uri: redirectUri } = event.queryStringParameters || {};
    if (redirectUri) {
      cookies.push(
        encodeCookie({
          name: 'redirect_uri',
          value: redirectUri,
          httponly: true,
          path: '/',
        })
      );
    }

    // redirect client to provider authorize url
    return {
      statusCode: 302,
      cookies,
      headers: {
        Location: authorizeUrl,
      },
    };
  }
);

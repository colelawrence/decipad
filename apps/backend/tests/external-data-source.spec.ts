import { createServer } from 'http';
import { readFileSync as readFile } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import getPort from 'get-port';
import getBody from 'raw-body';
import qs from 'qs';
import {
  parse as decodeCookie,
  stringify as encodeCookie,
} from 'simple-cookie';
import { ExternalDataSource, Pad } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import getDefined from './utils/get-defined';

test('external data source', (ctx) => {
  const { test: it } = ctx;
  let pad: Pad | undefined;
  let externalDataSource: ExternalDataSource | undefined;
  let thirdPartyServer: ReturnType<typeof createServer> | undefined;
  let thirdPartyServerPort: number | undefined;
  let thirdPartyServerHandler: Parameters<typeof createServer>[1] | undefined;
  let authCode: string | undefined;

  const thirdPartyServerProxy: Parameters<typeof createServer>[1] = (
    req,
    res
  ) => {
    if (!thirdPartyServerHandler) {
      res.statusCode = 500;
      res.end('no thirdPartyServerHandler is defined');
      return;
    }
    thirdPartyServerHandler(req, res);
  };

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const workspace = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createWorkspace;

    expect(workspace).toMatchObject({ name: 'Workspace 1' });

    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1" }
            ) {
              id
              name
            }
          }
        `,
      })
    ).data.createPad;
  });

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const newDataSource = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createExternalDataSource(
              dataSource: {
                padId: "${getDefined(pad).id}"
                name: "test data source 1"
                provider: testdatasource
                externalId: "external id"
              }
            ) {
              id
              dataUrl
              authUrl
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    expect(newDataSource).toMatchObject({
      id: expect.stringMatching(/.+/),
      dataUrl: expect.stringMatching(/http:\/\/.+/),
      authUrl: expect.stringMatching(/http:\/\/.+/),
    });

    externalDataSource = newDataSource;
  });

  it('trying to fetch data from one with no keys results in authentication error', async () => {
    const fetchOptions = ctx.http.withAuthOptions((await ctx.auth()).token);
    const { dataUrl } = getDefined(externalDataSource);
    const response = await fetch(dataUrl, fetchOptions);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(await response.text()).toMatch(/needs authentication/i);
  });

  beforeAll((done) => {
    // Create third-party server
    thirdPartyServer = createServer(thirdPartyServerProxy);

    getPort()
      .then((port) => {
        thirdPartyServerPort = port;
        getDefined(thirdPartyServer).listen(port, () => done());
      })
      .catch(done);
  });

  afterAll((done) => {
    // close third-party server
    if (thirdPartyServer) {
      thirdPartyServer.close(done);
    } else {
      done();
    }
  });

  it('client is able to do the oauth dance', async () => {
    let callbackUrl: string | null = null;
    const fetchWithAuthOptions = ctx.http.withAuthOptions(
      (await ctx.auth()).token
    );
    const { authUrl } = getDefined(externalDataSource);
    const response = await fetch(authUrl, {
      ...fetchWithAuthOptions,
      headers: {
        ...fetchWithAuthOptions.headers,
        'x-use-third-party-test-server': `http://localhost:${getDefined(
          thirdPartyServerPort
        )}`,
      },
      redirect: 'manual', // manual redirect because we're mocking auth provider
    });

    // expect a redirect
    expect(response.status).toBe(302);
    const redirectTo = response.headers.get('Location');
    expect(redirectTo).toMatch(
      /^http:\/\/localhost:[0-9]+\/testdatasource\/authorization\?.*$/
    );
    const cookies = response.headers
      .get('set-cookie')
      ?.split(',')
      .map((c) => decodeCookie(c));

    // handle third-party auth request
    thirdPartyServerHandler = (req, res) => {
      expect(req.method).toBe('GET');
      const url = new URL(
        getDefined(req.url),
        `http://localhost:${getDefined(thirdPartyServerPort)}`
      );
      const params = url.searchParams;
      expect(params.get('scope')).toBe('testdatasourcescope');
      expect(params.get('client_id')).toBe('testdatasourceclientid');
      expect(params.get('redirect_uri')).toMatch(
        /^http:\/\/localhost:[0-9]+\/api\/externaldatasources\/callback/
      );
      callbackUrl = params.get('redirect_uri');

      res.statusCode = 201;
      res.end('ok');
    };

    // simulate client-side redirect
    const authResponse = await fetch(getDefined(redirectTo));
    expect(authResponse.ok).toBe(true);
    const url = getDefined(callbackUrl, 'no save token url');
    authCode = nanoid();
    const saveToken = new URL(
      `${url}?code=${encodeURIComponent(authCode)}&externaldatasourceid=${
        getDefined(externalDataSource).id
      }`
    );

    // handle third-party token fetch request
    thirdPartyServerHandler = (req, res) => {
      expect(req.method).toBe('POST');
      const reqUrl = new URL(
        getDefined(req.url),
        `http://localhost:${getDefined(thirdPartyServerPort)}`
      );
      expect(reqUrl.pathname).toBe('/testdatasource/token');
      expect(req.headers['content-type']).toMatch(
        /application\/x-www-form-urlencoded/
      );

      // gather body
      getBody(req, { encoding: 'utf-8' }, (err, body) => {
        if (err) {
          res.statusCode = 500;
          // eslint-disable-next-line no-console
          console.error(err);
          res.end(err.message);
          return;
        }

        const reqBody = qs.parse(body);
        expect(reqBody.grant_type).toBe('authorization_code');
        expect(reqBody.client_id).toBe('testdatasourceclientid');
        expect(reqBody.client_secret).toBe('testdatasourceclientsecret');
        expect(reqBody.code).toBe(authCode);

        const tokenResponse = {
          access_token: 'testdatasourcefakeaccesstoken',
          refresh_token: 'testdatasourcefakerefreshtoken',
          expires_in: 42, // seconds
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(tokenResponse));
      });
    };

    // continue simulating client-side redirect
    await fetch(saveToken.toString(), {
      ...fetchWithAuthOptions,
      headers: {
        ...fetchWithAuthOptions.headers,
        'x-use-third-party-test-server': `http://localhost:${getDefined(
          thirdPartyServerPort
        )}`,
        cookie: cookies?.map((cookie) => encodeCookie(cookie)).join(', ') || '',
      },
    });
  });

  it('fetching data works after having access token', async () => {
    const fetchOptions = ctx.http.withAuthOptions((await ctx.auth()).token);
    const { dataUrl } = getDefined(externalDataSource);

    // handle third-party data fetch request
    thirdPartyServerHandler = (req, res) => {
      expect(req.headers.authorization).toBe(
        'Bearer testdatasourcefakeaccesstoken'
      );
      res.setHeader('content-type', 'text/csv');
      res.end(readFile(join(__dirname, 'data', 'test1.csv')));
    };

    const response = await fetch(dataUrl, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        'x-use-third-party-test-server': `http://localhost:${getDefined(
          thirdPartyServerPort
        )}`,
      },
    });
    expect(response.ok).toBe(true);
  });
});

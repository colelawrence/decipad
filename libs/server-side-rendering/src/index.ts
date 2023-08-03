/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import dns from 'node:dns';
import './globalPolyfills';
import Boom from '@hapi/boom';
import { handle } from './handle';
// eslint-disable-next-line import/no-extraneous-dependencies
import { renderNotebook } from './renderNotebook';
import { Handler } from './types';
import { loadManifest } from './utils/loadManifest';
import { sessionFromReq } from './utils/sessionFromReq';
import { app } from '@decipad/backend-config';

dns.setDefaultResultOrder('ipv4first');

dns.setDefaultResultOrder('ipv4first');

type GlobalWithSSR = typeof global & { __DECI_IS_SSR__?: boolean };
(global as GlobalWithSSR).__DECI_IS_SSR__ = true;

export const handler: Handler = handle(async (req) => {
  const notebookId = (req.pathParameters ?? {}).notebookid;
  if (!notebookId) {
    throw Boom.badRequest('no notebook id');
  }

  const [manifest, session] = await Promise.all([
    loadManifest(),
    sessionFromReq(req),
  ]);
  // eslint-disable-next-line no-console
  console.debug('RENDER STARTED');
  const start = Date.now();
  const body = await renderNotebook({
    jsEntryPoint: manifest.files['main.js'],
    baseUrl: app().urlBase,
    notebookId,
    cookies: req.cookies ?? [],
    session,
  });
  const elapsed = Date.now() - start;
  // eslint-disable-next-line no-console
  console.log(`RENDER FINISHED in ${elapsed}ms`);
  return {
    statusCode: 200,
    body,
    headers: {
      'content-type': 'text/html',
    },
  };
});

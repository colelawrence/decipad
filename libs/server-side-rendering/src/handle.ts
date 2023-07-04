/* eslint-disable import/no-extraneous-dependencies */
import { timeout } from '@decipad/utils';
import { trace, captureException } from '@decipad/backend-trace';
import { Handler, Response } from './types';
import { RENDER_TIMEOUT_MS } from './constants';
import { fallbackHandler } from './fallbackHandler';

export const handle =
  (handler: Handler): Handler =>
  async (req, context, callback) => {
    let replied = false;
    const abortTimeout = new AbortController();

    const timeoutHandler = async () => {
      await timeout(RENDER_TIMEOUT_MS, abortTimeout.signal);
      if (replied) {
        return;
      }
      // eslint-disable-next-line no-console
      console.error(`SSR: timeout after ${RENDER_TIMEOUT_MS}ms`);
      // report timeout
      await captureException(
        new Error(`render timed out after ${RENDER_TIMEOUT_MS} ms`)
      );
      return fallbackHandler(req, 'timeout');
    };

    const fallback =
      (h: Handler): Handler =>
      (...args): void | Promise<Response> => {
        const p = h(...args);
        if (p) {
          return p
            .then((reply) => {
              setTimeout(() => {
                abortTimeout.abort();
              }, 0);
              replied = true;
              return reply;
            })
            .catch(async (err) => {
              // eslint-disable-next-line no-console
              console.error('Error caught while SSR', err, args[0]);
              await captureException(err);
              replied = true;
              return fallbackHandler(req, (err as Error).message);
            });
        }
      };

    return Promise.race([
      timeoutHandler(),
      trace(fallback(handler))(req, context, callback),
    ]);
  };

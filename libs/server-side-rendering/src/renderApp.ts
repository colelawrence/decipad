/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
import { ReactElement } from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import htmlescape from 'htmlescape';
import createEmotionServer from '@emotion/server/create-instance';

import { EmotionCache } from '@emotion/react';
import { Session } from 'next-auth';
import { captureException } from '@decipad/backend-trace';
import { bufferStream } from './utils/bufferStream';
import { RENDER_TIMEOUT_MS } from './constants';

export interface RenderDependencies {
  jsEntryPoint: string;
  emotionCache: EmotionCache;
  getElement: () => ReactElement;
  renderToPipeableStream: typeof renderToPipeableStream;
  documentTemplate: string;
  extractData: () => unknown;
  urlBase: string;
  session: Session;
}

ReactDOM.createPortal = (() => {
  // eslint-disable-next-line no-console
  console.trace(
    'someone created a portal, which is not supported in React SSR'
  );
}) as unknown as typeof ReactDOM.createPortal;

export const renderApp = (dependencies: RenderDependencies) => {
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(dependencies.emotionCache);

  const prepass = (element: ReactElement): Promise<string> =>
    new Promise((onReady, onFinalError) => {
      let timedOut = false;
      let rendered = false;
      const render = (force = false) => {
        if (rendered && !force) {
          return;
        }
        rendered = true;
        // eslint-disable-next-line no-use-before-define
        pipe(s);
      };
      const onError = (err: unknown) => {
        if (!timedOut) {
          onFinalError(err);
        }
      };
      const [s, p] = bufferStream();
      const { pipe, abort } = renderToPipeableStream(element, {
        onAllReady: render,
        onError,
      });

      const timeout = setTimeout(async () => {
        await captureException(
          new Error(`app render timed out after ${RENDER_TIMEOUT_MS} ms`)
        );
        timedOut = true;
        try {
          render();
          abort();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error aborting', err);
          const result = renderToString(element);
          onReady(result);
        }
      }, RENDER_TIMEOUT_MS);

      p.then((res) => {
        clearTimeout(timeout);
        onReady(res);
      }).catch(onError);
    });

  return prepass(dependencies.getElement()).then((markup) => {
    const data = htmlescape(dependencies.extractData());
    const chunks = extractCriticalToChunks(markup);
    const styles = constructStyleTagsFromChunks(chunks);

    const { documentTemplate } = dependencies;
    return documentTemplate
      .replaceAll('%PUBLIC_URL%', dependencies.urlBase)
      .replace('<styles data-decipad-bootstrap></styles>', styles)
      .replace('%DECIPAD_ROOT%', markup)
      .replace(
        '<script data-decipad-bootstrap></script>',
        `<script>window.__SESSION__=(${htmlescape(
          dependencies.session
        )});window.__REQUIRE_HYDRATION__=true;window.__URQL_DATA__=(${data});</script>`
      )
      .replace(
        '<script src="/static/js/bundle.js" async=""></script>',
        `<script src="${dependencies.jsEntryPoint}" async=""></script>`
      )
      .replace('<script defer="defer" src="/index.js"></script>', '');
  });
};

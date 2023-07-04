import documentTemplate from '../public/index.html';
import { Request, Response } from './types';
import { loadManifest } from './utils/loadManifest';
import { baseUrlFromReq } from './utils/baseUrlFromReq';
import loadingMarkup from '../public/loadingMarkup.html';

export type ReplyingHandler = (
  req: Request,
  reason?: string
) => Promise<Response>;

export const fallbackHandler: ReplyingHandler = async (
  req: Request,
  reason = 'unknown'
) => {
  // eslint-disable-next-line no-console
  console.log(`replying with fallback because ${reason}`);
  const baseUrl = baseUrlFromReq(req);
  const manifest = await loadManifest(req);
  const jsEntryPoint = manifest.files['main.js'];

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html',
    },
    body: documentTemplate
      .replaceAll('%PUBLIC_URL%', baseUrl)
      .replace('<styles data-decipad-bootstrap></styles>', '')
      .replace('%DECIPAD_ROOT%', loadingMarkup)
      .replace(
        '<script src="/static/js/bundle.js" async=""></script>',
        `<script src="${jsEntryPoint}" async=""></script>`
      ),
  };
};

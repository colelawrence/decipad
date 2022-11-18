import { getDefined } from '@decipad/utils';

type GetURLComponentsResult = {
  docId: string;
  blockId: string;
};

export const getURLComponents = (source: string): GetURLComponentsResult => {
  const url = new URL(source);
  const docIdMatch = getDefined(
    url.pathname.match(/^\/n\/(.*)/),
    `Could not find notebook id from URL${url}`
  );
  const blockId = url.hash.slice(1);
  let docId = decodeURIComponent(
    getDefined(docIdMatch[1], `no doc id on URL ${url}`)
  );
  if (docId.indexOf(':') >= 0) {
    docId = docId.slice(docId.indexOf(':') + 1);
  }

  return { docId, blockId };
};

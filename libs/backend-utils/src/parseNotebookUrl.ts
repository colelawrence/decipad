import Boom from '@hapi/boom';

export function parseNotebookUrl(url: string) {
  const matchExp = /^https:\/\/(.+)\.decipad.com\/n\/([^/]+)/;
  const match = matchExp.exec(url);
  if (!match) {
    throw Boom.notAcceptable(`notebook url seems invalid: ${url}`);
  }
  const [, prEnvId, notebookId] = match;
  const idParts = decodeURIComponent(notebookId).split(':');
  return {
    prEnvId,
    notebookId: idParts[1] ?? idParts[0],
  };
}

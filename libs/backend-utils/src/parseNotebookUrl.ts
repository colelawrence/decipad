import Boom from '@hapi/boom';

export function parseNotebookUrl(url: string) {
  const matchExp =
    /^https:\/\/([a-zA-Z0-9]+)\.decipad.com\/n\/([a-zA-Z0-9-]*)%3A([a-zA-Z0-9]+)/;
  const match = matchExp.exec(url);
  if (!match) {
    throw Boom.notAcceptable(`notebook url seems invalid: ${url}`);
  }
  const [, prEnvId, notebookId] = match;
  return {
    prEnvId,
    notebookId,
  };
}

import { ImportElementSource } from '@decipad/editor-types';

const supportedPathTerminations = new Map<string, ImportElementSource>([
  ['.csv', 'csv'],
  ['.arrow', 'arrow'],
  ['.json', 'json'],
]);
const supportedContentTypes = new Map<string, ImportElementSource>([
  ['text/csv', 'csv'],
  ['application/json', 'json'],
  ['application/vnd.apache.arrow', 'arrow'],
]);

export const isRandomImportUrl = async (
  url: URL
): Promise<[boolean, undefined | ImportElementSource]> => {
  const key = Array.from(supportedPathTerminations.keys()).find((path) =>
    url.pathname.endsWith(path)
  );
  if (key) {
    return [true, supportedPathTerminations.get(key)];
  }

  try {
    const { headers } = await fetch(url);
    const type = headers.get('Content-Type');
    if (type) {
      const contentTypeKey = Array.from(supportedContentTypes.keys()).find(
        (contentType) => type.startsWith(contentType)
      );
      if (contentTypeKey) {
        return [true, supportedContentTypes.get(contentTypeKey)];
      }
    }
  } catch (err) {
    // do nothing
  }
  return [false, undefined];
};

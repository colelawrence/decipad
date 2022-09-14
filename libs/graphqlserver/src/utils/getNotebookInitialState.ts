import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { nanoid } from 'nanoid';
import {
  mergeUpdates,
  Doc as YDoc,
  Map as YMap,
  Array as YArray,
  Text as YText,
} from 'yjs';

const emptyValue = 'AAA=';

type LeafElement = YMap<YText>;
type RootElement = YMap<YArray<LeafElement> | string>;
export type Doc = YArray<RootElement>;

const ensureInitialDocument = (doc: YDoc, root: Doc) => {
  doc.transact(() => {
    if (root.length > 1) {
      return;
    }
    if (root.length < 1) {
      root.push([
        new YMap([
          ['type', 'h1'],
          ['children', YArray.from([new YMap([['text', new YText()]])])],
          ['id', nanoid()],
        ]),
      ]);
    }
    if (root.length < 2) {
      root.push([
        new YMap([
          ['type', 'p'],
          ['children', YArray.from([new YMap([['text', new YText()]])])],
          ['id', nanoid()],
        ]),
      ]);
    }
  });
};

const getUpdates = async (notebookId: string): Promise<Uint8Array[]> => {
  return new Promise((resolve, reject) => {
    try {
      const updates: Uint8Array[] = [];
      const doc = new YDoc();
      const shared = doc.getArray<RootElement>();
      const provider = new DynamodbPersistence(`/pads/${notebookId}`, doc);
      doc.on('update', (update: Uint8Array) => {
        updates.push(update);
      });
      provider.once('fetched', () => {
        ensureInitialDocument(doc, shared);
        resolve(updates);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const encode = (buf: Uint8Array) => Buffer.from(buf).toString('base64');

export const getNotebookInitialState = async (
  notebookId: string
): Promise<string> => {
  const encoded = encode(mergeUpdates(await getUpdates(notebookId)));
  return encoded === emptyValue ? '' : encoded;
};

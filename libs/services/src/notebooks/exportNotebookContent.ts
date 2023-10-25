import { Document, RootDocument } from '@decipad/editor-types';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { applyUpdate, Doc as YDoc } from 'yjs';

export const exportNotebookContent = <
  T extends RootDocument | Document = Document
>(
  id: string,
  remoteUpdates?: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new YDoc();
      const provider = new DynamodbPersistence(`/pads/${id}`, doc);
      provider.once('fetched', () => {
        if (remoteUpdates) {
          const update = Buffer.from(remoteUpdates, 'base64');
          applyUpdate(doc, update, 'remote');
        }
        try {
          resolve({ children: doc.getArray().toJSON() } as T);
        } catch (err2) {
          reject(err2);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

import { SharedType, toSharedType } from '@decipad/slate-yjs';
import { MyElement } from '@decipad/editor-types';
import { Doc as YDoc } from 'yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';

function createPadContent(path: string, content: MyElement[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new YDoc();
      const provider = new DynamodbPersistence(path, doc);
      doc.on('update', (update: Uint8Array, origin: unknown) => {
        provider.storeUpdate(update, origin);
      });
      doc.transact(() => {
        const children = doc.getArray() as SharedType;
        toSharedType(children, content);
      });
      provider.once('saved', () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function create(id: string, content: MyElement[]): Promise<void> {
  await createPadContent(`/pads/${id}`, content);
}

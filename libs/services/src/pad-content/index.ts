import type { SharedType } from '@decipad/slate-yjs';
import type { MyValue } from '@decipad/editor-types';
import { Doc as YDoc } from 'yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { toSharedTypeSingular } from 'libs/slate-yjs/src/utils';
import { EElement, Value } from '@udecode/plate';

const createPadContent = <V extends Value = MyValue>(
  path: string,
  content: EElement<V>[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new YDoc();
      const provider = new DynamodbPersistence(path, doc);
      doc.on('update', (update: Uint8Array, origin: unknown) => {
        provider.storeUpdate(update, origin);
      });

      /** The reason we iterate, instead of simply uploading the content array,
       * is because DynamoDB has a size limit on a singular record. So if the notebook
       * is too large, then it would reject the update.
       * Hence why now we iterate over each block in the notebook instead.
       */
      const sharedType = doc.getArray() as SharedType;
      content.forEach((block, i) => {
        doc.transact(() => {
          toSharedTypeSingular(sharedType, block, i);
        });
      });

      provider.once('flushed', () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
};

export const create = <V extends Value = MyValue>(
  id: string,
  content: EElement<V>[]
): Promise<void> => {
  return createPadContent(`/pads/${id}`, content);
};

import { Buffer } from 'buffer';
import {
  Doc as YDoc,
  Map as YMap,
  Array as YArray,
  Text as YText,
  applyUpdate,
} from 'yjs';
import tables, { allPages } from '@decipad/tables';
import { getDefined, noop } from '@decipad/utils';
import { nanoid } from 'nanoid';

function setTitle(doc: YDoc, newTitle: string): void {
  if (!doc.getArray().get(0)) {
    doc.getArray().insert(0, [new YMap()]);
  }
  const h1 = doc.getArray().get(0) as YMap<YArray<YMap<YText>>>;
  if (!h1.get('children')) {
    h1.set('children', new YArray() as YArray<YMap<YText>>);
  }
  const children = getDefined(h1.get('children'));
  if (!children.get(0)) {
    children.insert(0, [new YMap<YText>()]);
  }
  const textNode = getDefined(children.get(0));
  if (!textNode.get('text')) {
    textNode.set('text', new YText());
  }
  const text = getDefined(textNode.get('text'));
  const existingText = text.toString();
  if (existingText !== newTitle) {
    if (existingText.length > 0) {
      text.delete(0, existingText.length);
    }
    text.insert(0, newTitle);
  }
}

async function duplicateSharedDoc(
  oldId: string,
  newId: string,
  newTitle: string
): Promise<void> {
  const data = await tables();
  const oldResource = `/pads/${oldId}`;
  const newResource = `/pads/${newId}`;
  const doc = new YDoc();
  for await (const update of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': oldResource,
    },
    ConsistentRead: true,
  })) {
    if (update) {
      await data.docsyncupdates.put({
        id: newResource,
        seq: update.seq,
        data: update.data,
      });
      applyUpdate(doc, Buffer.from(update.data, 'base64'));
    }
  }

  let flush = Promise.resolve();
  function saveUpdate(update: Uint8Array) {
    flush = Promise.all([
      flush,
      data.docsyncupdates.put({
        id: newResource,
        seq: `Date.now():${nanoid()}`,
        data: Buffer.from(update).toString('base64'),
      }),
    ]).then(noop);
  }

  doc.on('update', saveUpdate);
  setTitle(doc, newTitle);

  await flush;
}

export async function duplicate(
  oldId: string,
  newId: string,
  newTitle: string
): Promise<void> {
  await duplicateSharedDoc(oldId, newId, newTitle);
}

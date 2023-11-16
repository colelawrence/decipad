import { Doc as YDoc } from 'yjs';
import { SyncElement, applySlateOps } from '@decipad/slate-yjs';
import { nanoid } from 'nanoid';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { slateYjsSymbol } from './docsync';
import { isFlagEnabled } from '@decipad/feature-flags';
import { starterNotebook } from './initialNotebook';
import { MyValue } from '@decipad/editor-types';

export async function initNewDocument(docId: string): Promise<void> {
  const doc = new YDoc();
  const persistence = new IndexeddbPersistence(docId, doc);
  const x = doc.getArray<SyncElement>();

  await persistence.whenSynced;

  applySlateOps(
    x,
    [
      {
        type: 'insert_node',
        path: [0],
        node: {
          type: 'title',
          id: nanoid(),
          children: [{ text: 'Welcome to Decipad!' }],
        },
      },
      {
        type: 'insert_node',
        path: [1],
        node: {
          type: 'tab',
          id: nanoid(),
          children: getTabContent(),
          name: 'New Tab',
        },
      },
    ],
    slateYjsSymbol
  );

  await persistence.flush();
  doc.destroy();
}

function getTabContent(): MyValue {
  if (isFlagEnabled('POPULATED_NEW_NOTEBOOK')) {
    return starterNotebook;
  }
  return [{ type: 'p', id: nanoid(), children: [{ text: '' }] }];
}

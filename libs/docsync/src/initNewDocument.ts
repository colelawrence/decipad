import { Doc as YDoc } from 'yjs';
import type { SyncElement } from '@decipad/slate-yjs';
import { applySlateOps } from '@decipad/slate-yjs';
import { nanoid } from 'nanoid';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { slateYjsSymbol } from './docsync';
import { isFlagEnabled } from '@decipad/feature-flags';
import { starterNotebook } from './initialNotebook';
import {
  ELEMENT_DATA_TAB,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  type MyValue,
} from '@decipad/editor-types';

export interface InitDocumentResult {
  id: string;
  tabId: string;
  name: string;
}

export async function initNewDocument(
  docId: string
): Promise<InitDocumentResult> {
  const doc = new YDoc();
  const persistence = new IndexeddbPersistence(docId, doc);
  const x = doc.getArray<SyncElement>();

  await persistence.whenSynced;

  const firstTabId = nanoid();
  const name = 'Welcome to Decipad!';

  applySlateOps(
    x,
    [
      {
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TITLE,
          id: nanoid(),
          children: [{ text: name }],
        },
      },
      {
        type: 'insert_node',
        path: [1],
        node: {
          type: ELEMENT_DATA_TAB,
          id: nanoid(),
          children: [],
          name: 'New Tab',
        },
      },
      {
        type: 'insert_node',
        path: [2],
        node: {
          type: ELEMENT_TAB,
          id: firstTabId,
          children: getTabContent(),
          name: 'New Tab',
        },
      },
    ],
    slateYjsSymbol
  );

  await persistence.flush();
  doc.destroy();

  return { id: docId, tabId: firstTabId, name };
}

function getTabContent(): MyValue {
  if (isFlagEnabled('POPULATED_NEW_NOTEBOOK')) {
    return starterNotebook;
  }
  return [{ type: 'p', id: nanoid(), children: [{ text: '' }] }];
}

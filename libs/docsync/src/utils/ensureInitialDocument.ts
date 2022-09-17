import { Array as YArray, Doc as YDoc, Map as YMap, Text as YText } from 'yjs';
import { nanoid } from 'nanoid';
import * as DocTypes from '../types';

export function ensureInitialDocument(doc: YDoc, root: DocTypes.Doc) {
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
}
